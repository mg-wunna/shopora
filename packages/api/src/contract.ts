import { oc } from "@orpc/contract";
import { z } from "zod";
import {
  AnalyticsSchema,
  AuthTokenSchema,
  CartAddInputSchema,
  CartRemoveInputSchema,
  CartSchema,
  CategorySchema,
  CheckoutInputSchema,
  DiscountCreateSchema,
  DiscountSchema,
  DiscountValidateInputSchema,
  HealthSchema,
  IdParamSchema,
  LoginInputSchema,
  OrderSchema,
  OrderStatusUpdateSchema,
  ProductCreateSchema,
  ProductListQuerySchema,
  ProductListResultSchema,
  ProductSchema,
  ProductUpdateSchema,
  RegisterInputSchema,
  StripeCheckoutInputSchema,
  StripeCheckoutSessionSchema,
  StripeConfirmInputSchema,
  UserSchema,
} from "./schemas.js";

export const healthContract = oc.route({ method: "GET", path: "/health" }).output(HealthSchema);

export const authContract = oc.router({
  register: oc
    .route({ method: "POST", path: "/auth/register" })
    .input(RegisterInputSchema)
    .output(AuthTokenSchema),
  login: oc
    .route({ method: "POST", path: "/auth/login" })
    .input(LoginInputSchema)
    .output(AuthTokenSchema),
  me: oc.route({ method: "GET", path: "/auth/me" }).output(UserSchema),
});

export const productsContract = oc.router({
  list: oc
    .route({ method: "GET", path: "/products" })
    .input(ProductListQuerySchema)
    .output(ProductListResultSchema),
  get: oc
    .route({ method: "GET", path: "/products/{id}" })
    .input(IdParamSchema)
    .output(ProductSchema),
  create: oc
    .route({ method: "POST", path: "/products" })
    .input(ProductCreateSchema)
    .output(ProductSchema),
  update: oc
    .route({ method: "PUT", path: "/products/{id}" })
    .input(ProductUpdateSchema)
    .output(ProductSchema),
  delete: oc
    .route({ method: "DELETE", path: "/products/{id}" })
    .input(IdParamSchema)
    .output(z.object({ deleted: z.boolean() })),
});

export const categoriesContract = oc.router({
  list: oc.route({ method: "GET", path: "/categories" }).output(z.array(CategorySchema)),
});

export const cartContract = oc.router({
  get: oc.route({ method: "GET", path: "/cart" }).output(CartSchema),
  add: oc.route({ method: "POST", path: "/cart/add" }).input(CartAddInputSchema).output(CartSchema),
  remove: oc
    .route({ method: "POST", path: "/cart/remove" })
    .input(CartRemoveInputSchema)
    .output(CartSchema),
  clear: oc.route({ method: "POST", path: "/cart/clear" }).output(CartSchema),
});

export const discountsContract = oc.router({
  list: oc.route({ method: "GET", path: "/discounts" }).output(z.array(DiscountSchema)),
  create: oc
    .route({ method: "POST", path: "/discounts" })
    .input(DiscountCreateSchema)
    .output(DiscountSchema),
  delete: oc
    .route({ method: "DELETE", path: "/discounts/{id}" })
    .input(IdParamSchema)
    .output(z.object({ deleted: z.boolean() })),
  validate: oc
    .route({ method: "POST", path: "/discounts/validate" })
    .input(DiscountValidateInputSchema)
    .output(DiscountSchema),
});

export const ordersContract = oc.router({
  checkout: oc
    .route({ method: "POST", path: "/orders" })
    .input(CheckoutInputSchema)
    .output(OrderSchema),
  list: oc.route({ method: "GET", path: "/orders" }).output(z.array(OrderSchema)),
  get: oc.route({ method: "GET", path: "/orders/{id}" }).input(IdParamSchema).output(OrderSchema),
  stripeCheckout: oc
    .route({ method: "POST", path: "/payment/stripe-checkout" })
    .input(StripeCheckoutInputSchema)
    .output(StripeCheckoutSessionSchema),
  stripeConfirm: oc
    .route({ method: "POST", path: "/payment/stripe-confirm" })
    .input(StripeConfirmInputSchema)
    .output(OrderSchema),
});

export const adminContract = oc.router({
  analytics: oc.route({ method: "GET", path: "/admin/analytics" }).output(AnalyticsSchema),
  orders: oc.route({ method: "GET", path: "/admin/orders" }).output(z.array(OrderSchema)),
  users: oc.route({ method: "GET", path: "/admin/users" }).output(z.array(UserSchema)),
  updateOrderStatus: oc
    .route({ method: "PUT", path: "/admin/orders/{id}" })
    .input(OrderStatusUpdateSchema)
    .output(OrderSchema),
});

export const appContract = oc.router({
  health: healthContract,
  auth: authContract,
  products: productsContract,
  categories: categoriesContract,
  cart: cartContract,
  discounts: discountsContract,
  orders: ordersContract,
  admin: adminContract,
});

export type AppContract = typeof appContract;
