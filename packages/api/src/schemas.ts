import { z } from "zod";

export const HealthSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.number(),
});
export type Health = z.infer<typeof HealthSchema>;

// ---------- Common ----------
export const IdParamSchema = z.object({ id: z.string() });
export type IdParam = z.infer<typeof IdParamSchema>;

// ---------- Auth ----------
export const RoleSchema = z.enum(["user", "admin"]);
export type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  createdAt: z.number(),
});
export type User = z.infer<typeof UserSchema>;

export const RegisterInputSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(120),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const AuthTokenSchema = z.object({
  token: z.string(),
  user: UserSchema,
});
export type AuthToken = z.infer<typeof AuthTokenSchema>;

// ---------- Category ----------
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

// ---------- Product ----------
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  price: z.number(),
  stock: z.number().int().nonnegative(),
  categoryId: z.string(),
  categoryName: z.string().optional(),
  images: z.array(z.string()),
  rating: z.number().min(0).max(5),
  featured: z.boolean(),
  createdAt: z.number(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating"]).optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(60).optional(),
});
export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;

export const ProductListResultSchema = z.object({
  items: z.array(ProductSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type ProductListResult = z.infer<typeof ProductListResultSchema>;

export const ProductCreateSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().min(1).max(2000),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  categoryId: z.string(),
  images: z.array(z.string()).min(1),
  featured: z.boolean().optional(),
});
export type ProductCreate = z.infer<typeof ProductCreateSchema>;

export const ProductUpdateSchema = ProductCreateSchema.partial().extend({
  id: z.string(),
});
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;

// ---------- Cart ----------
export const CartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  quantity: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  items: z.array(CartItemSchema),
  subtotal: z.number(),
});
export type Cart = z.infer<typeof CartSchema>;

export const CartAddInputSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().max(99),
});
export type CartAddInput = z.infer<typeof CartAddInputSchema>;

export const CartRemoveInputSchema = z.object({ productId: z.string() });
export type CartRemoveInput = z.infer<typeof CartRemoveInputSchema>;

// ---------- Discount ----------
export const DiscountSchema = z.object({
  id: z.string(),
  code: z.string(),
  percentage: z.number().min(0).max(100),
  expiresAt: z.number(),
});
export type Discount = z.infer<typeof DiscountSchema>;

export const DiscountValidateInputSchema = z.object({ code: z.string() });
export type DiscountValidateInput = z.infer<typeof DiscountValidateInputSchema>;

export const DiscountCreateSchema = z.object({
  code: z.string().min(2).max(40),
  percentage: z.number().min(1).max(90),
  expiresAt: z.number(),
});
export type DiscountCreate = z.infer<typeof DiscountCreateSchema>;

// ---------- Order ----------
export const OrderStatusSchema = z.enum(["pending", "paid", "shipped", "delivered", "canceled"]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  items: z.array(OrderItemSchema),
  subtotal: z.number(),
  discountCode: z.string().nullable(),
  discountAmount: z.number(),
  totalAmount: z.number(),
  status: OrderStatusSchema,
  paymentId: z.string().nullable(),
  shippingAddress: z.string(),
  createdAt: z.number(),
});
export type Order = z.infer<typeof OrderSchema>;

export const CheckoutInputSchema = z.object({
  shippingAddress: z.string().min(5).max(500),
  discountCode: z.string().optional(),
});
export type CheckoutInput = z.infer<typeof CheckoutInputSchema>;

export const StripeCheckoutInputSchema = z.object({
  orderId: z.string(),
});
export type StripeCheckoutInput = z.infer<typeof StripeCheckoutInputSchema>;

export const StripeCheckoutSessionSchema = z.object({
  sessionId: z.string(),
  url: z.string().url(),
});
export type StripeCheckoutSession = z.infer<typeof StripeCheckoutSessionSchema>;

export const StripeConfirmInputSchema = z.object({
  orderId: z.string(),
  sessionId: z.string(),
});
export type StripeConfirmInput = z.infer<typeof StripeConfirmInputSchema>;

export const OrderStatusUpdateSchema = z.object({
  id: z.string(),
  status: OrderStatusSchema,
});
export type OrderStatusUpdate = z.infer<typeof OrderStatusUpdateSchema>;

// ---------- Admin ----------
export const AnalyticsSchema = z.object({
  totalRevenue: z.number(),
  totalOrders: z.number(),
  totalProducts: z.number(),
  totalUsers: z.number(),
  recentOrders: z.array(OrderSchema),
  topProducts: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      sold: z.number(),
      revenue: z.number(),
    }),
  ),
  revenueByDay: z.array(z.object({ day: z.string(), revenue: z.number() })),
});
export type Analytics = z.infer<typeof AnalyticsSchema>;
