import { appContract } from "@template/api";
import { ORPCError, implement } from "@orpc/server";
import mongoose from "mongoose";
import { hashPassword, signToken, verifyPassword } from "./auth.js";
import {
  CartModel,
  CategoryModel,
  DiscountModel,
  OrderModel,
  ProductModel,
  UserModel,
  type CategoryDoc,
  type OrderDoc,
  type ProductDoc,
  type UserDoc,
} from "./models.js";
import { toCategory, toDiscount, toOrder, toProduct, toUser } from "./serialize.js";
import { getStripeClient, getWebsiteUrl } from "./stripe.js";

export interface Ctx {
  user: UserDoc | null;
}

const os = implement(appContract).$context<Ctx>();

function requireUser(ctx: Ctx): UserDoc {
  if (!ctx.user) throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
  return ctx.user;
}

function requireAdmin(ctx: Ctx): UserDoc {
  const user = requireUser(ctx);
  if (user.role !== "admin") throw new ORPCError("FORBIDDEN", { message: "Admin access required" });
  return user;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toStripeImageUrl(image: string): string | undefined {
  if (!image) return undefined;
  if (/^https?:\/\//.test(image)) return image;
  if (image.startsWith("/")) return `${getWebsiteUrl()}${image}`;
  return undefined;
}

async function loadCategoryNameMap(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const cats = await CategoryModel.find({ _id: { $in: ids } }).lean<CategoryDoc[]>();
  return new Map(cats.map((c) => [c._id.toString(), c.name]));
}

async function buildCart(userId: mongoose.Types.ObjectId) {
  const cart = await CartModel.findOne({ userId }).lean();
  if (!cart || cart.items.length === 0) return { items: [], subtotal: 0 };
  const productIds = cart.items.map((it) => it.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } }).lean<ProductDoc[]>();
  const byId = new Map(products.map((p) => [p._id.toString(), p]));
  const items = cart.items
    .map((it) => {
      const p = byId.get(it.productId.toString());
      if (!p) return null;
      return {
        productId: p._id.toString(),
        name: p.name,
        price: p.price,
        image: p.images[0] ?? "",
        quantity: it.quantity,
        stock: p.stock,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  return { items, subtotal };
}

async function settlePaidOrder(
  order: mongoose.HydratedDocument<OrderDoc>,
  user: UserDoc,
  paymentId: string,
) {
  if (order.status !== "pending") return toOrder(order, user);

  const products = await ProductModel.find({
    _id: { $in: order.items.map((it) => it.productId) },
  }).lean<ProductDoc[]>();
  const stockById = new Map(products.map((product) => [product._id.toString(), product.stock]));
  const insufficient = order.items.find(
    (it) => (stockById.get(it.productId.toString()) ?? 0) < it.quantity,
  );
  if (insufficient)
    throw new ORPCError("BAD_REQUEST", {
      message: `Insufficient stock for ${insufficient.name}`,
    });

  for (const it of order.items) {
    await ProductModel.updateOne(
      { _id: it.productId, stock: { $gte: it.quantity } },
      { $inc: { stock: -it.quantity } },
    );
  }
  order.status = "paid";
  order.paymentId = paymentId;
  await order.save();
  for (const it of order.items) {
    await CartModel.updateOne(
      { userId: user._id },
      { $pull: { items: { productId: it.productId, quantity: { $lte: it.quantity } } } },
    );
    await CartModel.updateOne(
      {
        userId: user._id,
        "items.productId": it.productId,
        "items.quantity": { $gt: it.quantity },
      },
      { $inc: { "items.$.quantity": -it.quantity } },
    );
  }
  return toOrder(order, user);
}

export const appRouter = os.router({
  health: os.health.handler(() => ({ status: "ok" as const, timestamp: Date.now() })),

  auth: {
    register: os.auth.register.handler(async ({ input }) => {
      const existing = await UserModel.findOne({ email: input.email.toLowerCase() }).lean();
      if (existing) throw new ORPCError("CONFLICT", { message: "Email already registered" });
      const passwordHash = await hashPassword(input.password);
      const created = await UserModel.create({
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: "user",
      });
      return { token: signToken(created), user: toUser(created) };
    }),

    login: os.auth.login.handler(async ({ input }) => {
      const user = await UserModel.findOne({ email: input.email.toLowerCase() });
      if (!user) throw new ORPCError("UNAUTHORIZED", { message: "Invalid credentials" });
      const ok = await verifyPassword(input.password, user.passwordHash);
      if (!ok) throw new ORPCError("UNAUTHORIZED", { message: "Invalid credentials" });
      return { token: signToken(user), user: toUser(user) };
    }),

    me: os.auth.me.handler(({ context }) => toUser(requireUser(context))),
  },

  products: {
    list: os.products.list.handler(async ({ input }) => {
      const filter: Record<string, unknown> = {};
      if (input.q) filter.name = { $regex: input.q, $options: "i" };
      if (input.category) filter.categoryId = input.category;
      if (input.featured) filter.featured = true;
      if (input.minPrice !== undefined || input.maxPrice !== undefined) {
        const range: Record<string, number> = {};
        if (input.minPrice !== undefined) range.$gte = input.minPrice;
        if (input.maxPrice !== undefined) range.$lte = input.maxPrice;
        filter.price = range;
      }
      const sortMap: Record<string, Record<string, 1 | -1>> = {
        newest: { createdAt: -1 },
        price_asc: { price: 1 },
        price_desc: { price: -1 },
        rating: { rating: -1 },
      };
      const sort = sortMap[input.sort ?? "newest"];
      const page = input.page ?? 1;
      const limit = input.limit ?? 12;
      const [docs, total] = await Promise.all([
        ProductModel.find(filter)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean<ProductDoc[]>(),
        ProductModel.countDocuments(filter),
      ]);
      const catMap = await loadCategoryNameMap(docs.map((d) => d.categoryId.toString()));
      return {
        items: docs.map((d) => toProduct(d, catMap.get(d.categoryId.toString()))),
        total,
        page,
        limit,
      };
    }),

    get: os.products.get.handler(async ({ input }) => {
      if (!mongoose.isValidObjectId(input.id))
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      const doc = await ProductModel.findById(input.id).lean<ProductDoc>();
      if (!doc) throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      const cat = await CategoryModel.findById(doc.categoryId).lean<CategoryDoc>();
      return toProduct(doc, cat?.name);
    }),

    create: os.products.create.handler(async ({ input, context }) => {
      requireAdmin(context);
      const slug = `${slugify(input.name)}-${Date.now().toString(36)}`;
      const doc = await ProductModel.create({
        ...input,
        slug,
        rating: 4.5,
        featured: input.featured ?? false,
      });
      const cat = await CategoryModel.findById(doc.categoryId).lean<CategoryDoc>();
      return toProduct(doc, cat?.name);
    }),

    update: os.products.update.handler(async ({ input, context }) => {
      requireAdmin(context);
      const { id, ...rest } = input;
      const doc = await ProductModel.findByIdAndUpdate(id, rest, {
        new: true,
      }).lean<ProductDoc>();
      if (!doc) throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      const cat = await CategoryModel.findById(doc.categoryId).lean<CategoryDoc>();
      return toProduct(doc, cat?.name);
    }),

    delete: os.products.delete.handler(async ({ input, context }) => {
      requireAdmin(context);
      const result = await ProductModel.findByIdAndDelete(input.id);
      return { deleted: result !== null };
    }),
  },

  categories: {
    list: os.categories.list.handler(async () => {
      const docs = await CategoryModel.find().sort({ name: 1 }).lean<CategoryDoc[]>();
      return docs.map(toCategory);
    }),
  },

  cart: {
    get: os.cart.get.handler(async ({ context }) => {
      const user = requireUser(context);
      return buildCart(user._id);
    }),

    add: os.cart.add.handler(async ({ input, context }) => {
      const user = requireUser(context);
      if (!mongoose.isValidObjectId(input.productId))
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      const product = await ProductModel.findById(input.productId).lean<ProductDoc>();
      if (!product) throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      let cart = await CartModel.findOne({ userId: user._id });
      if (!cart) cart = await CartModel.create({ userId: user._id, items: [] });
      const productObjId = new mongoose.Types.ObjectId(input.productId);
      const existing = cart.items.find((it) => it.productId.equals(productObjId));
      if (existing) {
        existing.quantity = Math.min(existing.quantity + input.quantity, product.stock);
      } else {
        cart.items.push({
          productId: productObjId,
          quantity: Math.min(input.quantity, product.stock),
        });
      }
      await cart.save();
      return buildCart(user._id);
    }),

    remove: os.cart.remove.handler(async ({ input, context }) => {
      const user = requireUser(context);
      const productObjId = new mongoose.Types.ObjectId(input.productId);
      await CartModel.updateOne(
        { userId: user._id },
        { $pull: { items: { productId: productObjId } } },
      );
      return buildCart(user._id);
    }),

    clear: os.cart.clear.handler(async ({ context }) => {
      const user = requireUser(context);
      await CartModel.updateOne({ userId: user._id }, { $set: { items: [] } });
      return buildCart(user._id);
    }),
  },

  discounts: {
    list: os.discounts.list.handler(async ({ context }) => {
      requireAdmin(context);
      const docs = await DiscountModel.find().sort({ expiresAt: -1 }).lean();
      return docs.map(toDiscount);
    }),

    create: os.discounts.create.handler(async ({ input, context }) => {
      requireAdmin(context);
      const doc = await DiscountModel.create({
        code: input.code.toUpperCase(),
        percentage: input.percentage,
        expiresAt: new Date(input.expiresAt),
      });
      return toDiscount(doc);
    }),

    delete: os.discounts.delete.handler(async ({ input, context }) => {
      requireAdmin(context);
      const result = await DiscountModel.findByIdAndDelete(input.id);
      return { deleted: result !== null };
    }),

    validate: os.discounts.validate.handler(async ({ input }) => {
      const doc = await DiscountModel.findOne({ code: input.code.toUpperCase() }).lean();
      if (!doc) throw new ORPCError("NOT_FOUND", { message: "Discount not found" });
      if (new Date(doc.expiresAt).getTime() < Date.now())
        throw new ORPCError("BAD_REQUEST", { message: "Discount expired" });
      return toDiscount(doc);
    }),
  },

  orders: {
    checkout: os.orders.checkout.handler(async ({ input, context }) => {
      const user = requireUser(context);
      const cart = await buildCart(user._id);
      if (cart.items.length === 0) throw new ORPCError("BAD_REQUEST", { message: "Cart is empty" });
      for (const it of cart.items) {
        if (it.quantity > it.stock)
          throw new ORPCError("BAD_REQUEST", {
            message: `Insufficient stock for ${it.name}`,
          });
      }
      let discountCode: string | null = null;
      let discountPct = 0;
      if (input.discountCode) {
        const d = await DiscountModel.findOne({ code: input.discountCode.toUpperCase() }).lean();
        if (!d) throw new ORPCError("BAD_REQUEST", { message: "Invalid discount" });
        if (new Date(d.expiresAt).getTime() < Date.now())
          throw new ORPCError("BAD_REQUEST", { message: "Discount expired" });
        discountCode = d.code;
        discountPct = d.percentage;
      }
      const subtotal = cart.subtotal;
      const discountAmount = +((subtotal * discountPct) / 100).toFixed(2);
      const totalAmount = +(subtotal - discountAmount).toFixed(2);
      const order = await OrderModel.create({
        userId: user._id,
        items: cart.items.map((it) => ({
          productId: new mongoose.Types.ObjectId(it.productId),
          name: it.name,
          image: it.image,
          price: it.price,
          quantity: it.quantity,
        })),
        subtotal,
        discountCode,
        discountAmount,
        totalAmount,
        status: "pending",
        paymentId: null,
        shippingAddress: input.shippingAddress,
      });
      return toOrder(order, user);
    }),

    list: os.orders.list.handler(async ({ context }) => {
      const user = requireUser(context);
      const docs = await OrderModel.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
      return docs.map((d) => toOrder(d, user));
    }),

    get: os.orders.get.handler(async ({ input, context }) => {
      const user = requireUser(context);
      if (!mongoose.isValidObjectId(input.id))
        throw new ORPCError("NOT_FOUND", { message: "Order not found" });
      const doc = await OrderModel.findById(input.id).lean();
      if (!doc) throw new ORPCError("NOT_FOUND", { message: "Order not found" });
      if (user.role !== "admin" && !doc.userId.equals(user._id))
        throw new ORPCError("FORBIDDEN", { message: "Access denied" });
      return toOrder(doc, user);
    }),

    stripeCheckout: os.orders.stripeCheckout.handler(async ({ input, context }) => {
      const user = requireUser(context);
      if (!mongoose.isValidObjectId(input.orderId))
        throw new ORPCError("NOT_FOUND", { message: "Order not found" });
      const order = await OrderModel.findById(input.orderId);
      if (!order) throw new ORPCError("NOT_FOUND", { message: "Order not found" });
      if (!order.userId.equals(user._id))
        throw new ORPCError("FORBIDDEN", { message: "Access denied" });
      if (order.status !== "pending")
        throw new ORPCError("BAD_REQUEST", { message: "Order is not payable" });

      const stripe = getStripeClient();
      if (!stripe)
        throw new ORPCError("BAD_REQUEST", {
          message: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.development.",
        });

      const websiteUrl = getWebsiteUrl();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: user.email,
        client_reference_id: order._id.toString(),
        success_url: `${websiteUrl}/order/?id=${order._id.toString()}&stripe=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${websiteUrl}/checkout?stripe=cancelled`,
        metadata: {
          orderId: order._id.toString(),
          userId: user._id.toString(),
        },
        line_items: order.items.map((it) => {
          const imageUrl = toStripeImageUrl(it.image);
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: it.name,
                ...(imageUrl ? { images: [imageUrl] } : {}),
              },
              unit_amount: Math.round(it.price * 100),
            },
            quantity: it.quantity,
          };
        }),
      });

      if (!session.url)
        throw new ORPCError("BAD_REQUEST", { message: "Stripe did not return a Checkout URL" });
      return { sessionId: session.id, url: session.url };
    }),

    stripeConfirm: os.orders.stripeConfirm.handler(async ({ input, context }) => {
      const user = requireUser(context);
      if (!mongoose.isValidObjectId(input.orderId))
        throw new ORPCError("NOT_FOUND", { message: "Order not found" });
      const order = await OrderModel.findById(input.orderId);
      if (!order) throw new ORPCError("NOT_FOUND", { message: "Order not found" });
      if (!order.userId.equals(user._id))
        throw new ORPCError("FORBIDDEN", { message: "Access denied" });
      if (order.status !== "pending") return toOrder(order, user);

      const stripe = getStripeClient();
      if (!stripe)
        throw new ORPCError("BAD_REQUEST", {
          message: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.development.",
        });

      const session = await stripe.checkout.sessions.retrieve(input.sessionId);
      if (session.metadata?.orderId !== order._id.toString())
        throw new ORPCError("FORBIDDEN", { message: "Stripe session does not match this order" });
      if (session.payment_status !== "paid")
        throw new ORPCError("BAD_REQUEST", { message: "Stripe payment has not completed" });

      return settlePaidOrder(order, user, `stripe_${session.id}`);
    }),
  },

  admin: {
    analytics: os.admin.analytics.handler(async ({ context }) => {
      requireAdmin(context);
      const [totalRevenueAgg, totalOrders, totalProducts, totalUsers, recentOrdersDocs] =
        await Promise.all([
          OrderModel.aggregate<{ _id: null; total: number }>([
            { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ]),
          OrderModel.countDocuments(),
          ProductModel.countDocuments(),
          UserModel.countDocuments(),
          OrderModel.find().sort({ createdAt: -1 }).limit(8).lean(),
        ]);
      const userIds = recentOrdersDocs.map((o) => o.userId);
      const users = await UserModel.find({ _id: { $in: userIds } }).lean<UserDoc[]>();
      const userMap = new Map(users.map((u) => [u._id.toString(), u]));
      const recentOrders = recentOrdersDocs.map((d) =>
        toOrder(d, userMap.get(d.userId.toString())),
      );

      const topProductsAgg = await OrderModel.aggregate<{
        _id: mongoose.Types.ObjectId;
        name: string;
        sold: number;
        revenue: number;
      }>([
        { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            sold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]);

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const revenueByDayAgg = await OrderModel.aggregate<{ _id: string; revenue: number }>([
        {
          $match: {
            status: { $in: ["paid", "shipped", "delivered"] },
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return {
        totalRevenue: totalRevenueAgg[0]?.total ?? 0,
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders,
        topProducts: topProductsAgg.map((p) => ({
          productId: p._id.toString(),
          name: p.name,
          sold: p.sold,
          revenue: p.revenue,
        })),
        revenueByDay: revenueByDayAgg.map((r) => ({ day: r._id, revenue: r.revenue })),
      };
    }),

    orders: os.admin.orders.handler(async ({ context }) => {
      requireAdmin(context);
      const docs = await OrderModel.find().sort({ createdAt: -1 }).limit(200).lean();
      const userIds = docs.map((d) => d.userId);
      const users = await UserModel.find({ _id: { $in: userIds } }).lean<UserDoc[]>();
      const userMap = new Map(users.map((u) => [u._id.toString(), u]));
      return docs.map((d) => toOrder(d, userMap.get(d.userId.toString())));
    }),

    users: os.admin.users.handler(async ({ context }) => {
      requireAdmin(context);
      const docs = await UserModel.find().sort({ createdAt: -1 }).lean<UserDoc[]>();
      return docs.map(toUser);
    }),

    updateOrderStatus: os.admin.updateOrderStatus.handler(async ({ input, context }) => {
      requireAdmin(context);
      const existing = await OrderModel.findById(input.id);
      if (!existing) throw new ORPCError("NOT_FOUND", { message: "Order not found" });
      if (["paid", "shipped", "delivered"].includes(input.status) && !existing.paymentId)
        throw new ORPCError("BAD_REQUEST", {
          message: "Stripe payment must be verified before fulfillment.",
        });
      existing.status = input.status;
      const doc = await existing.save();
      if (!doc) throw new ORPCError("NOT_FOUND", { message: "Order not found" });
      const owner = await UserModel.findById(doc.userId).lean<UserDoc>();
      return toOrder(doc, owner);
    }),
  },
});

export type AppRouter = typeof appRouter;
