import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";

/**
 * Shown during the "waiting for backend verification" phase.
 * CRITICAL: We never show tickets here — the frontend does not decide
 * that payment succeeded. The backend/webhook flow does.
 */
export function PaymentProcessingState({ step = "processing" }) {
  const copy = {
    processing: {
      title: "Processing your payment",
      body: "Please don't close this page. We'll update automatically.",
    },
    verifying: {
      title: "Confirming your payment",
      body: "Our system is verifying the transaction with the payment provider. This usually takes a few seconds.",
    },
    delayed: {
      title: "Still confirming your payment",
      body: "Verification is taking longer than usual. You'll receive your tickets by email and they'll appear in My Tickets as soon as it completes.",
    },
  }[step];

  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center mb-4"
      >
        <Loader2 size={26} className="text-primary animate-spin" />
      </motion.div>
      <h3 className="text-lg font-semibold text-foreground">{copy.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto text-pretty">
        {copy.body}
      </p>
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-subtle">
        <ShieldCheck size={14} />
        Your payment is protected. We never share your details.
      </div>
    </div>
  );
}

export default PaymentProcessingState;