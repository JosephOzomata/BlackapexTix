import { Outlet } from "react-router-dom";
import { ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

/**
 * Scanner shell — mobile-first, minimal chrome. The scanner UI is
 * deliberately close to a native app feel.
 */
export default function ScannerLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <header className="sticky top-0 z-sticky border-b border-border bg-background/90 backdrop-blur-md safe-top">
        <div className="h-14 px-4 flex items-center">
          <Link to={ROUTES.scanner.home} className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-info/20 text-info flex items-center justify-center">
              <ScanLine size={16} />
            </span>
            <span className="font-semibold text-sm">Scanner</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}