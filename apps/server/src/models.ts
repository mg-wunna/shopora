import mongoose, { Schema } from "mongoose";

export interface UserDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  createdAt: Date;
}

const UserSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const UserModel = mongoose.model<UserDoc>("User", UserSchema);

export interface CategoryDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
}

const CategorySchema = new Schema<CategoryDoc>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
});

export const CategoryModel = mongoose.model<CategoryDoc>("Category", CategorySchema);

export interface ProductDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  categoryId: mongoose.Types.ObjectId;
  images: string[];
  rating: number;
  featured: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true, index: "text" },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ProductModel = mongoose.model<ProductDoc>("Product", ProductSchema);

export interface CartLineDoc {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface CartDoc {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: CartLineDoc[];
}

const CartSchema = new Schema<CartDoc>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
});

export const CartModel = mongoose.model<CartDoc>("Cart", CartSchema);

export interface OrderItemDoc {
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "canceled";

export interface OrderDoc {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: OrderItemDoc[];
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentId: string | null;
  shippingAddress: string;
  createdAt: Date;
}

const OrderSchema = new Schema<OrderDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        image: { type: String, default: "" },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    subtotal: { type: Number, required: true },
    discountCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "canceled"],
      default: "pending",
      index: true,
    },
    paymentId: { type: String, default: null },
    shippingAddress: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const OrderModel = mongoose.model<OrderDoc>("Order", OrderSchema);

export interface DiscountDoc {
  _id: mongoose.Types.ObjectId;
  code: string;
  percentage: number;
  expiresAt: Date;
}

const DiscountSchema = new Schema<DiscountDoc>({
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  expiresAt: { type: Date, required: true },
});

export const DiscountModel = mongoose.model<DiscountDoc>("Discount", DiscountSchema);
