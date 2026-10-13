import { Drawer } from "./Drawer";

/**
 * Bottom sheet — same engine as Drawer, tuned for mobile UX
 * (safe-area padding, snap-ish spring, rounded top).
 */
export function Sheet({ open, onClose, title, children, footer, className }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="bottom"
      title={title}
      footer={footer}
      className={className}
    >
      {children}
    </Drawer>
  );
}

export default Sheet;