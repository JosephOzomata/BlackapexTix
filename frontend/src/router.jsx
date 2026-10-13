import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { ROUTES } from "./constants/routes";
import PublicLayout from "./components/layout/PublicLayout";
import CustomerLayout from "./components/layout/CustomerLayout";
import OrganizerLayout from "./components/layout/OrganizerLayout";
import ScannerLayout from "./components/layout/ScannerLayout";
import AdminLayout from "./components/layout/AdminLayout";
import {
  RequireAuth,
  RequireOrganizer,
  RequireScanner,
  RequireAdmin,
  RedirectIfAuthed,
} from "./components/layout/RouteGuards";
import NotFoundPage, { RouteErrorBoundary } from "./pages/public/NotFoundPage";
import { Spinner } from "./components/common/Spinner";

/* ---------- Route-based code splitting ---------- */
const HomePage = lazy(() => import("./pages/public/HomePage"));
const EventsPage = lazy(() => import("./pages/public/EventsPage"));
const EventDetailPage = lazy(() => import("./pages/public/EventDetailPage"));
const OrganizerPublicPage = lazy(() => import("./pages/public/OrganizerPublicPage"));
const AboutPage = lazy(() => import("./pages/public/AboutPage"));
const ContactPage = lazy(() => import("./pages/public/ContactPage"));

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));

const CheckoutFlow = lazy(() => import("./features/checkout/CheckoutFlow"));

const MyTicketsPage = lazy(() => import("./pages/customer/MyTicketsPage"));
const TicketDetailPage = lazy(() => import("./pages/customer/TicketDetailPage"));
const GroupOrderPage = lazy(() => import("./pages/customer/GroupOrderPage"));
const OrderHistoryPage = lazy(() => import("./pages/customer/OrderHistoryPage"));
const ProfilePage = lazy(() => import("./pages/customer/ProfilePage"));

const OrganizerDashboardPage = lazy(() => import("./pages/organizer/OrganizerDashboardPage"));
const OrganizerEventsPage = lazy(() => import("./pages/organizer/OrganizerEventsPage"));
const OrganizerEventNewPage = lazy(() => import("./pages/organizer/OrganizerEventNewPage"));
const OrganizerEventDetailPage = lazy(() => import("./pages/organizer/OrganizerEventDetailPage"));
const OrganizerEventEditPage = lazy(() => import("./pages/organizer/OrganizerEventEditPage"));
const OrganizerEventTicketsPage = lazy(() => import("./pages/organizer/OrganizerEventTicketsPage"));
const OrganizerEventAttendeesPage = lazy(() => import("./pages/organizer/OrganizerEventAttendeesPage"));
const OrganizerEventScannersPage = lazy(() => import("./pages/organizer/OrganizerEventScannersPage"));
const OrganizerEventAnalyticsPage = lazy(() => import("./pages/organizer/OrganizerEventAnalyticsPage"));
const OrganizerTransactionsPage = lazy(() => import("./pages/organizer/OrganizerTransactionsPage"));
const OrganizerProfilePage = lazy(() => import("./pages/organizer/OrganizerProfilePage"));

const ScannerHomePage = lazy(() => import("./pages/scanner/ScannerHomePage"));
const ScannerEventPage = lazy(() => import("./pages/scanner/ScannerEventPage"));

const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminEventsPage = lazy(() => import("./pages/admin/AdminEventsPage"));
const AdminOrganizersPage = lazy(() => import("./pages/admin/AdminOrganizersPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminTransactionsPage = lazy(() => import("./pages/admin/AdminTransactionsPage"));
const AdminModerationPage = lazy(() => import("./pages/admin/AdminModerationPage"));

function SuspenseFallback() {
  return (
    <div className="min-h-[60dvh] flex items-center justify-center">
      <Spinner size="lg" label="Loading page" />
    </div>
  );
}

const withSuspense = (node) => <Suspense fallback={<SuspenseFallback />}>{node}</Suspense>;

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      /* ---------------- Public ---------------- */
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: withSuspense(<HomePage />) },
          { path: "events", element: withSuspense(<EventsPage />) },
          { path: "events/:slug", element: withSuspense(<EventDetailPage />) },
          { path: "organizers/:slug", element: withSuspense(<OrganizerPublicPage />) },
          { path: "about", element: withSuspense(<AboutPage />) },
          { path: "contact", element: withSuspense(<ContactPage />) },

          /* Auth pages live under public shell */
          {
            element: <RedirectIfAuthed />,
            children: [
              { path: "login", element: withSuspense(<LoginPage />) },
              { path: "register", element: withSuspense(<RegisterPage />) },
              { path: "forgot-password", element: withSuspense(<ForgotPasswordPage />) },
              { path: "reset-password", element: withSuspense(<ResetPasswordPage />) },
            ],
          },
          { path: "verify-email", element: withSuspense(<VerifyEmailPage />) },

          /* Missing event / organizer slug variants */
          { path: "events/:slug/*", element: <NotFoundPage context="event" /> },
          { path: "organizers/:slug/*", element: <NotFoundPage context="event" /> },

          /* Wildcard — falls to the polished public 404 */
          { path: "*", element: <NotFoundPage context="public" /> },
        ],
      },

      /* ---------------- Customer area ---------------- */
      {
        element: <RequireAuth />,
        children: [
          {
            element: <CustomerLayout />,
            children: [
              { path: "my-tickets", element: withSuspense(<MyTicketsPage />) },
              { path: "my-tickets/group/:orderId", element: withSuspense(<GroupOrderPage />) },
              { path: "my-tickets/:ticketId", element: withSuspense(<TicketDetailPage />) },
              { path: "orders", element: withSuspense(<OrderHistoryPage />) },
              { path: "account", element: withSuspense(<ProfilePage />) },
              { path: "checkout/:slug", element: withSuspense(<CheckoutFlow />) },
              { path: "checkout/:slug/*", element: <NotFoundPage context="customer" /> },
              { path: "my-tickets/*", element: <NotFoundPage context="customer" /> },
            ],
          },
        ],
      },

      /* ---------------- Organizer area ---------------- */
      {
        element: <RequireOrganizer />,
        children: [
          {
            path: "organizer",
            element: <OrganizerLayout />,
            children: [
              { index: true, element: withSuspense(<OrganizerDashboardPage />) },
              { path: "events", element: withSuspense(<OrganizerEventsPage />) },
              { path: "events/new", element: withSuspense(<OrganizerEventNewPage />) },
              { path: "events/:eventId", element: withSuspense(<OrganizerEventDetailPage />) },
              { path: "events/:eventId/edit", element: withSuspense(<OrganizerEventEditPage />) },
              { path: "events/:eventId/tickets", element: withSuspense(<OrganizerEventTicketsPage />) },
              { path: "events/:eventId/attendees", element: withSuspense(<OrganizerEventAttendeesPage />) },
              { path: "events/:eventId/scanners", element: withSuspense(<OrganizerEventScannersPage />) },
              { path: "events/:eventId/analytics", element: withSuspense(<OrganizerEventAnalyticsPage />) },
              { path: "transactions", element: withSuspense(<OrganizerTransactionsPage />) },
              { path: "profile", element: withSuspense(<OrganizerProfilePage />) },
              { path: "*", element: <NotFoundPage context="organizer" /> },
            ],
          },
        ],
      },

      /* ---------------- Scanner area ---------------- */
      {
        element: <RequireScanner />,
        children: [
          {
            path: "scanner",
            element: <ScannerLayout />,
            children: [
              { index: true, element: withSuspense(<ScannerHomePage />) },
              { path: "events/:eventId", element: withSuspense(<ScannerEventPage />) },
              { path: "*", element: <NotFoundPage context="scanner" /> },
            ],
          },
        ],
      },

      /* ---------------- Super admin ---------------- */
      {
        element: <RequireAdmin />,
        children: [
          {
            path: "admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: withSuspense(<AdminDashboardPage />) },
              { path: "events", element: withSuspense(<AdminEventsPage />) },
              { path: "organizers", element: withSuspense(<AdminOrganizersPage />) },
              { path: "users", element: withSuspense(<AdminUsersPage />) },
              { path: "transactions", element: withSuspense(<AdminTransactionsPage />) },
              { path: "moderation", element: withSuspense(<AdminModerationPage />) },
              { path: "*", element: <NotFoundPage context="admin" /> },
            ],
          },
        ],
      },

      /* Legacy redirects */
      { path: "dashboard", element: <Navigate to={ROUTES.organizer.dashboard} replace /> },
    ],
  },
]);

export default router;