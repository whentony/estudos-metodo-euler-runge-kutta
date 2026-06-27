import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("performance", "routes/performance.tsx")
] satisfies RouteConfig;
