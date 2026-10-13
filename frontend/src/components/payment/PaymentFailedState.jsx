import { XCircle, RefreshCcw, ArrowLeft } from "lucide-react";
import { Button } from "../common/Button";

export function PaymentFailedState({ reason, onRetry, onBack }) {
  const messages = {
    PAYMENT_FAILED: {
      title: "Payment failed",
      body: "The payment could not be completed. No money was taken from your account.",
    },
    PAYMENT_CANCELLED: {
      title: "Payment was cancelled",
      body: "You cancelled the payment before it completed. Your tickets are still reserved for a short time.",
    },
    PAYMENT_PROVIDER_ERROR: {
      title: "The payment provider had a problem",
      body: "This is on the provider's side. You can safely try again.",
    },
    default: {
      title: "We couldn't complete your payment",
      body: "Something went wrong. Please try again or choose a different payment method.",
    },
  };
  const copy = messages[reason] ?? messages.default;

  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/5 p-8 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-danger/15 flex items-center justify-center mb-4">
        <XCircle size={26} className="text-danger" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{copy.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto text-pretty">
        {copy.body}
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
        {onRetry && (
          <Button onClick={onRetry} leftIcon={<RefreshCcw size={14} />}>
            Try again
          </Button>
        )}
        {onBack && (
          <Button variant="outline" onClick={onBack} leftIcon={<ArrowLeft size={14} />}>
            Back to event
          </Button>
        )}
      </div>
    </div>
  );
}

export default PaymentFailedState;