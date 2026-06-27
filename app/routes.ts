import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("performance", "routes/performance.tsx"),
  route("code-simulator", "routes/code-simulator.tsx"),
] satisfies RouteConfig;
