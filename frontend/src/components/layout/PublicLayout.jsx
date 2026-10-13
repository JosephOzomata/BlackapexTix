import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout() {
  const location = useLocation();
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <Navbar />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1"
        id="main-content"
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  );
}