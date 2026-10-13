import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

/**
 * Customer area — intentionally light. No sidebar, no fake dashboard.
 * Just the top nav + a centred content column.
 */
export default function CustomerLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}