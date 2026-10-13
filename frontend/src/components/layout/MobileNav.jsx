import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Ticket, User, LogIn } from "lucide-react";
import { APP } from "../../constants/config";
import { ROUTES } from "../../constants/routes";
import { IconButton } from "../common/IconButton";
import { Button } from "../common/Button";
import { useTrap } from "../../hooks/useFocusTrap";

export default function MobileNav({ links = [], isAuthed, onClose }) {
  const containerRef = useTrap({ active: true, onEscape: onClose });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-modal-backdrop bg-black/70 backdrop-blur-sm"
        aria-hidden
      />
      <motion.aside
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="fixed top-0 right-0 bottom-0 z-modal w-[min(88vw,360px)] bg-card border-l border-border flex flex-col safe-top safe-bottom"
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-border">
          <Link to={ROUTES.home} onClick={onClose} className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Ticket size={18} className="text-white" />
            </span>
            <span className="font-extrabold text-lg">{APP.name}</span>
          </Link>
          <IconButton label="Close menu" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile navigation">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={onClose}
              className="block rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-card-elevated"
            >
              {l.label}
            </Link>
          ))}
          <div className="my-3 h-px bg-border" />
          <Link
            to={ROUTES.myTickets}
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-base text-foreground hover:bg-card-elevated"
          >
            <Ticket size={18} /> My Tickets
          </Link>
          <Link
            to={ROUTES.profile}
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-base text-foreground hover:bg-card-elevated"
          >
            <User size={18} /> Account
          </Link>
        </nav>

        {!isAuthed && (
          <div className="p-4 border-t border-border grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              to={ROUTES.login}
              onClick={onClose}
              leftIcon={<LogIn size={16} />}
            >
              Sign in
            </Button>
            <Button variant="primary" to={ROUTES.register} onClick={onClose}>
              Register
            </Button>
          </div>
        )}
      </motion.aside>
    </>
  );
}