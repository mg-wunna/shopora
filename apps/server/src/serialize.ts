import type { Category, Discount, Order, Product, User } from "@template/api";
import type { CategoryDoc, DiscountDoc, OrderDoc, ProductDoc, UserDoc } from "./models.js";

export function toUser(d: UserDoc): User {
  return {
    id: d._id.toString(),
    name: d.name,
    email: d.email,
    role: d.role,
    createdAt: new Date(d.createdAt).getTime(),
  };
}

export function toCategory(d: CategoryDoc): Category {
  return { id: d._id.toString(), name: d.name, slug: d.slug };
}

export function toProduct(d: ProductDoc, categoryName?: string): Product {
  return {
    id: d._id.toString(),
    name: d.name,
    slug: d.slug,
    description: d.description,
    price: d.price,
    stock: d.stock,
    categoryId: d.categoryId.toString(),
    categoryName,
    images: d.images,
    rating: d.rating,
    featured: d.featured,
    createdAt: new Date(d.createdAt).getTime(),
  };
}

export function toDiscount(d: DiscountDoc): Discount {
  return {
    id: d._id.toString(),
    code: d.code,
    percentage: d.percentage,
    expiresAt: new Date(d.expiresAt).getTime(),
  };
}

export function toOrder(d: OrderDoc, user?: UserDoc | null): Order {
  return {
    id: d._id.toString(),
    userId: d.userId.toString(),
    userName: user?.name,
    userEmail: user?.email,
    items: d.items.map((it) => ({
      productId: it.productId.toString(),
      name: it.name,
      image: it.image,
      price: it.price,
      quantity: it.quantity,
    })),
    subtotal: d.subtotal,
    discountCode: d.discountCode,
    discountAmount: d.discountAmount,
    totalAmount: d.totalAmount,
    status: d.status,
    paymentId: d.paymentId,
    shippingAddress: d.shippingAddress,
    createdAt: new Date(d.createdAt).getTime(),
  };
}
