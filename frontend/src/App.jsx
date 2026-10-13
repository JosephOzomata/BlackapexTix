import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./components/layout/ScrollToTop";
import ToastContainer from "./components/common/ToastContainer";

/**
 * Root shell rendered for every route.
 * Providers (QueryClient, Router) live in main.jsx.
 * Layouts (Public / Customer / Organizer / Scanner / Admin) are chosen in router.jsx.
 */
export default function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
        <Outlet key={location.pathname} />
      </AnimatePresence>
      <ToastContainer />
    </>
  );
}