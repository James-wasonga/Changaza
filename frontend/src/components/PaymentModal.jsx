import { useEffect, useState } from "react";
import { Smartphone, CheckCircle2, Loader2, X } from "lucide-react";
import { initiatePayment, pollPaymentStatus } from "../services/paymentService";

const STAGE_COPY = {
  idle: "Preparing payment request…",
  sent: "Prompt sent to your phone",
  waiting: "Waiting for you to enter your PIN…",
  confirming: "Confirming payment…",
  done: "Payment confirmed",
};

export default function PaymentModal({ open, amount, currency, rail, phone, onSuccess, onClose }) {
  const [stage, setStage] = useState("idle");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStage("idle");
    setError("");
    setReceipt(null);

    (async () => {
      try {
        const { checkoutRequestId } = await initiatePayment({ railId: rail.id, amount, phone });
        if (cancelled) return;
        const result = await pollPaymentStatus(checkoutRequestId, (s) => !cancelled && setStage(s));
        if (cancelled) return;
        setReceipt(result.receipt);
        setTimeout(() => !cancelled && onSuccess(result), 700);
      } catch (e) {
        if (!cancelled) setError(e.message || "Payment failed. Please try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-sm bg-pitch-deep border border-pitch-line rounded-t-3xl sm:rounded-3xl p-6 pb-8 sm:pb-6 animate-riseIn">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs uppercase tracking-widest text-mute font-semibold">
            {rail.label} payment
          </span>
          {(error) && (
            <button onClick={onClose} className="text-mute hover:text-chalk" aria-label="Close">
              <X size={18} />
            </button>
          )}
        </div>

        {!error ? (
          <>
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold-dim flex items-center justify-center mb-4">
                {stage === "done" ? (
                  <CheckCircle2 size={30} className="text-gold-bright" />
                ) : (
                  <Smartphone size={26} className="text-gold-bright animate-pulseSoft" />
                )}
              </div>
              <p className="scoreboard-num text-2xl font-semibold text-chalk mb-1">
                {currency} {amount}
              </p>
              <p className="text-mute text-sm mb-1">to {phone}</p>
              <p className="text-gold-bright text-sm font-semibold min-h-[20px]">
                {STAGE_COPY[stage]}
              </p>
            </div>
            {stage !== "done" && (
              <div className="flex items-center justify-center gap-2 text-mute text-xs">
                <Loader2 size={14} className="animate-spin" />
                Simulated {rail.label} STK push — no real charge
              </div>
            )}
          </>
        ) : (
          <div className="py-4 text-center">
            <p className="text-coral font-semibold mb-4">{error}</p>
            <button onClick={onClose} className="btn-secondary w-full">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
