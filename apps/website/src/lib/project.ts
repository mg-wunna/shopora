export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const isProduction = process.env.NODE_ENV === "production";

export const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ||
  (isProduction ? "https://shopora-dashboard.pages.dev" : "http://localhost:3002");
export const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL || "https://github.com/mg-wunna/shopora";
export const PORTFOLIO_URL =
  process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://mg-wunna.vercel.app/";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (isProduction ? "https://shopora-website.pages.dev" : "http://localhost:3001");

export const DOCS_URL = `${API_URL}/docs`;

export const projectStats = [
  { label: "Products", value: "20" },
  { label: "Categories", value: "6" },
  { label: "API routes", value: "27" },
  { label: "Apps", value: "3" },
];
