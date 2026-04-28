import mongoose from "mongoose";
import { hashPassword } from "./auth.js";
import {
  CategoryModel,
  DiscountModel,
  OrderModel,
  ProductModel,
  UserModel,
  CartModel,
} from "./models.js";

const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/shopora";

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  rating: number;
  featured: boolean;
}

const CATEGORIES: { name: string; slug: string }[] = [
  { name: "Audio Atelier", slug: "audio" },
  { name: "Wearable Objects", slug: "wearables" },
  { name: "Studio Computing", slug: "computing" },
  { name: "Image Making", slug: "photography" },
  { name: "Connected Home", slug: "smart-home" },
  { name: "Carry & Desk", slug: "accessories" },
];

const PRODUCTS: SeedProduct[] = [
  {
    name: "Auralis Maison Headphones",
    description:
      "Lambskin over-ear cushions, adaptive silence, 48h battery, and a warm studio profile tuned for long listening sessions.",
    price: 649,
    stock: 18,
    category: "audio",
    images: [
      "/images/products/auralis-maison-headphones.jpg",
      "/images/products/auralis-maison-headphones-2.jpg",
    ],
    rating: 4.8,
    featured: true,
  },
  {
    name: "Lumen Ceramic Earbuds",
    description:
      "Gloss ceramic shells, hybrid ANC, spatial microphones, and a pocket case milled from anodized aluminum.",
    price: 289,
    stock: 32,
    category: "audio",
    images: ["/images/products/lumen-ceramic-earbuds.jpg"],
    rating: 4.6,
    featured: true,
  },
  {
    name: "Echo Walnut Column Speaker",
    description:
      "Room-calibrated 360 degree sound, brushed aluminum controls, and a walnut acoustic body for living rooms.",
    price: 799,
    stock: 12,
    category: "audio",
    images: ["/images/products/echo-walnut-column-speaker.jpg"],
    rating: 4.7,
    featured: false,
  },
  {
    name: "Pulse Titanium Watch",
    description:
      "Always-on sapphire display, ECG, sleep recovery, dual-band GPS, and a 14-day battery in a 36g titanium case.",
    price: 749,
    stock: 22,
    category: "wearables",
    images: ["/images/products/pulse-titanium-watch.jpg"],
    rating: 4.7,
    featured: true,
  },
  {
    name: "Trail Graphite Sport Band",
    description:
      "Featherweight activity band with heart rate, SpO2, IP68 sealing, and a matte graphite body.",
    price: 229,
    stock: 48,
    category: "wearables",
    images: ["/images/products/trail-graphite-sport-band.jpg"],
    rating: 4.4,
    featured: false,
  },
  {
    name: "Halo Brushed Smart Ring",
    description:
      "Sleep, readiness, and recovery telemetry from a 4g brushed titanium ring with a seven-day battery.",
    price: 399,
    stock: 16,
    category: "wearables",
    images: ["/images/products/halo-brushed-smart-ring.jpg"],
    rating: 4.5,
    featured: false,
  },
  {
    name: "Vertex Studio 14",
    description:
      "14 inch 3K OLED, pro-grade silicon, 32GB unified memory, 2TB SSD, and a 22h battery in a single aluminum piece.",
    price: 2499,
    stock: 9,
    category: "computing",
    images: ["/images/products/vertex-studio-14.jpg"],
    rating: 4.9,
    featured: true,
  },
  {
    name: "Nimbus Alloy Keyboard",
    description:
      "Low-profile hot-swap switches, PBT keycaps, tri-mode wireless, and a bead-blasted aluminum chassis.",
    price: 349,
    stock: 27,
    category: "computing",
    images: ["/images/products/nimbus-alloy-keyboard.jpg"],
    rating: 4.7,
    featured: false,
  },
  {
    name: "Glide Precision Mouse",
    description:
      "Sculpted magnesium shell, glass-smooth feet, 8000 DPI optical tracking, silent clicks, and a 90-day battery.",
    price: 149,
    stock: 42,
    category: "computing",
    images: ["/images/products/glide-precision-mouse.jpg"],
    rating: 4.5,
    featured: false,
  },
  {
    name: "Frame 27 Reference Display",
    description:
      "27 inch 5K panel, 99% DCI-P3, hardware calibration, etched glass, and USB-C 96W passthrough.",
    price: 1799,
    stock: 7,
    category: "computing",
    images: ["/images/products/frame-27-reference-display.jpg"],
    rating: 4.8,
    featured: true,
  },
  {
    name: "Optic X Full-Frame Body",
    description:
      "45MP full-frame sensor, 8K30 video, in-body stabilization, weather sealing, and a magnesium alloy chassis.",
    price: 3299,
    stock: 6,
    category: "photography",
    images: ["/images/products/optic-x-full-frame-body.jpg"],
    rating: 4.9,
    featured: true,
  },
  {
    name: "Vista 35mm Prime Lens",
    description:
      "Ultra-fast f/1.4 prime with cinematic falloff, silent linear AF, and a 380g all-metal barrel.",
    price: 1199,
    stock: 10,
    category: "photography",
    images: ["/images/products/vista-35mm-prime-lens.jpg"],
    rating: 4.7,
    featured: false,
  },
  {
    name: "Aero Pro Cinema Drone",
    description:
      "Foldable cinema drone with 4K HDR capture, 30-minute flight time, obstacle sensing, and a travel case.",
    price: 1499,
    stock: 8,
    category: "photography",
    images: ["/images/products/aero-pro-cinema-drone.jpg"],
    rating: 4.6,
    featured: false,
  },
  {
    name: "Glow Architectural Bulb Set",
    description:
      "Four dimmable glass bulbs with warm-to-cool tuning, scenes, schedules, and music-aware transitions.",
    price: 149,
    stock: 64,
    category: "smart-home",
    images: ["/images/products/glow-architectural-bulb-set.jpg"],
    rating: 4.4,
    featured: false,
  },
  {
    name: "Aegis Brass Smart Lock",
    description:
      "Fingerprint, PIN, encrypted Bluetooth, auto-lock, one-year battery, and a satin brass front plate.",
    price: 429,
    stock: 19,
    category: "smart-home",
    images: ["/images/products/aegis-brass-smart-lock.jpg"],
    rating: 4.5,
    featured: true,
  },
  {
    name: "Hearth Glass Thermostat",
    description:
      "A glass dial thermostat that learns routines, trims energy use, and disappears into warm modern interiors.",
    price: 329,
    stock: 24,
    category: "smart-home",
    images: ["/images/products/hearth-glass-thermostat.jpg"],
    rating: 4.6,
    featured: false,
  },
  {
    name: "Carry Atelier Backpack 26L",
    description:
      "Weatherproof recycled shell, lay-flat laptop bay, hidden passport pockets, and a structured silhouette.",
    price: 279,
    stock: 34,
    category: "accessories",
    images: ["/images/products/carry-atelier-backpack-26l.jpg"],
    rating: 4.7,
    featured: false,
  },
  {
    name: "Forge Qi2 Charging Stand",
    description:
      "15W Qi2 charging, weighted aluminum base, soft-touch hinge, and a travel-flat folding profile.",
    price: 129,
    stock: 76,
    category: "accessories",
    images: ["/images/products/forge-qi2-charging-stand.jpg"],
    rating: 4.3,
    featured: false,
  },
  {
    name: "Mesa Leather Desk Mat XL",
    description:
      "Full-grain leather surface, 90 x 40cm footprint, stitched edges, and a water-resistant underside.",
    price: 119,
    stock: 88,
    category: "accessories",
    images: ["/images/products/mesa-leather-desk-mat-xl.jpg"],
    rating: 4.4,
    featured: false,
  },
  {
    name: "Beam Pro USB-C Dock",
    description:
      "8-in-1 brushed aluminum dock with 4K60 HDMI, 100W PD, SD readers, Ethernet, and three USB-A ports.",
    price: 179,
    stock: 52,
    category: "accessories",
    images: ["/images/products/beam-pro-usb-c-dock.jpg"],
    rating: 4.5,
    featured: false,
  },
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main(): Promise<void> {
  await mongoose.connect(MONGO_URI);
  process.stderr.write(`[seed] Connected to ${MONGO_URI}\n`);

  await Promise.all([
    UserModel.deleteMany({}),
    CategoryModel.deleteMany({}),
    ProductModel.deleteMany({}),
    CartModel.deleteMany({}),
    OrderModel.deleteMany({}),
    DiscountModel.deleteMany({}),
  ]);
  process.stderr.write("[seed] Cleared existing collections\n");

  const adminPassword = await hashPassword("admin123");
  const userPassword = await hashPassword("password");
  await UserModel.insertMany([
    {
      name: "Shopora Admin",
      email: "admin@shopora.dev",
      passwordHash: adminPassword,
      role: "admin",
    },
    {
      name: "Demo Shopper",
      email: "demo@shopora.dev",
      passwordHash: userPassword,
      role: "user",
    },
  ]);
  process.stderr.write(
    "[seed] Created admin@shopora.dev / admin123 and demo@shopora.dev / password\n",
  );

  const categoryDocs = await CategoryModel.insertMany(CATEGORIES);
  const slugToId = new Map(categoryDocs.map((c) => [c.slug, c._id]));

  await ProductModel.insertMany(
    PRODUCTS.map((p) => ({
      name: p.name,
      slug: `${slugify(p.name)}-${Math.random().toString(36).slice(2, 6)}`,
      description: p.description,
      price: p.price,
      stock: p.stock,
      categoryId: slugToId.get(p.category),
      images: p.images,
      rating: p.rating,
      featured: p.featured,
    })),
  );
  process.stderr.write(
    `[seed] Inserted ${PRODUCTS.length} products across ${CATEGORIES.length} categories\n`,
  );

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  await DiscountModel.insertMany([
    { code: "WELCOME10", percentage: 10, expiresAt: new Date(now + 90 * day) },
    { code: "SUMMER20", percentage: 20, expiresAt: new Date(now + 60 * day) },
    { code: "VIP30", percentage: 30, expiresAt: new Date(now + 30 * day) },
  ]);
  process.stderr.write("[seed] Inserted discounts: WELCOME10, SUMMER20, VIP30\n");

  await mongoose.disconnect();
  process.stderr.write("[seed] Done\n");
}

main().catch((err) => {
  process.stderr.write(`[seed] Failed: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
