import "./mock-api";
import { DemoRunner } from "./demo/DemoRunner";

/**
 * ZeroAdmin Master Demo & Documentation App
 * 
 * This is the entry point for the development environment. 
 * It showcases the library's capabilities across different modes:
 * - Enterprise Dashboard (Multi-resource)
 * - Zero-Config Shorthand
 * - Live Preview Playground
 */
export default function App() {
  return <DemoRunner />;
}
