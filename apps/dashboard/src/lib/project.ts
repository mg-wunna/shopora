export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const WEBSITE_URL =
  import.meta.env.VITE_WEBSITE_URL ||
  (import.meta.env.PROD ? "https://shopora-website.pages.dev" : "http://localhost:3001");
export const DOCS_URL = `${API_URL}/docs`;
export const REPO_URL = import.meta.env.VITE_REPO_URL || "https://github.com/mg-wunna/shopora";
