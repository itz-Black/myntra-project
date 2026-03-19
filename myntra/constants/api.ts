/**
 * api.ts
 * Centralized API base URL configuration for the Myntra app.
 * - LOCAL_API  → Express backend running at localhost:5000 (recommendations, history)
 * - REMOTE_API → Deployed Render backend (products, bag, wishlist, orders)
 */

export const LOCAL_API = "http://localhost:5000";
export const REMOTE_API = "http://localhost:5001";
