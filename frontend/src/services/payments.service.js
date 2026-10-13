import { paymentsHandler } from "../mocks/handlers/payments.handler";
import { useAuthStore } from "../stores/authStore";

/**
 * Payments service — abstracted over the payment provider.
 * The UI never imports a provider SDK directly. Swapping to Paystack,
 * Flutterwave, Stripe, or another provider later means changing only
 * this file.
 *
 * CRITICAL: a successful client-side callback is NOT proof of payment.
 * Only verifyStatus() reporting PAID/FULFILLED counts as verified. The
 * frontend polls status; the real backend verifies via webhook.
 */

const currentUser = () => useAuthStore.getState().user;

export const paymentsService = {
  async initializeCheckout({ orderId, method = "card" }) {
    return paymentsHandler.initialize(currentUser(), { orderId, method });
  },

  async verifyOrderStatus(orderId) {
    return paymentsHandler.verifyStatus(orderId, currentUser());
  },

  async cancelPayment(orderId) {
    return paymentsHandler.cancel(orderId, currentUser());
  },

  /**
   * Poll until the order is fulfilled, failed, or a timeout is reached.
   * Uses exponential-ish backoff to keep polling polite.
   *
   * Resolves with the final payment status envelope.
   */
  async pollUntilResolved(orderId, {
    timeoutMs = 30_000,
    initialDelayMs = 900,
    maxDelayMs = 3000,
    onTick,
  } = {}) {
    const start = Date.now();
    let delay = initialDelayMs;

    while (Date.now() - start < timeoutMs) {
      const res = await paymentsHandler.verifyStatus(orderId, currentUser());
      if (onTick) onTick(res);
      if (!res.success) return res;

      const { orderStatus, paymentStatus } = res.data;
      if (
        orderStatus === "FULFILLED" ||
        orderStatus === "PAID" ||
        orderStatus === "FAILED" ||
        orderStatus === "CANCELLED" ||
        orderStatus === "EXPIRED" ||
        paymentStatus === "CONFIRMED" ||
        paymentStatus === "FAILED" ||
        paymentStatus === "CANCELLED" ||
        paymentStatus === "VERIFICATION_DELAYED"
      ) {
        return res;
      }

      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(maxDelayMs, Math.round(delay * 1.4));
    }

    return {
      success: false,
      code: "PAYMENT_VERIFICATION_DELAYED",
      message:
        "We're still confirming your payment. You'll receive your tickets by email and they'll appear in My Tickets as soon as verification completes.",
    };
  },
};

export default paymentsService;