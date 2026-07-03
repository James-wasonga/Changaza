// --- paymentService ---
// Abstraction over local mobile-money rails. M-Pesa is implemented here as a
// working simulation of the real Safaricom Daraja STK Push + polling flow,
// so this file is the only thing that needs to change to wire up the real API:
// initiatePayment() -> POST /mpesa/stkpush, pollPaymentStatus() -> poll your
// backend, which itself polls Safaricom's callback/status endpoint.

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

/**
 * Initiates a mobile money payment on the given rail.
 * Real M-Pesa equivalent: Safaricom Daraja "STK Push" request.
 */
export async function initiatePayment({ railId, amount, phone }) {
  await delay(700);
  if (!phone || phone.replace(/\D/g, "").length < 9) {
    throw new Error("Enter a valid phone number to receive the payment prompt.");
  }
  return {
    checkoutRequestId: randomId("ws_CO"),
    railId,
    amount,
    phone,
    status: "PENDING",
  };
}

/**
 * Polls for payment confirmation, mirroring how you'd poll your backend
 * while it waits on Safaricom's asynchronous callback.
 * onTick(stage) reports progress for the UI: "sent" -> "waiting" -> "confirming" -> "done"
 */
export async function pollPaymentStatus(checkoutRequestId, onTick) {
  onTick?.("sent");
  await delay(1100);
  onTick?.("waiting");
  await delay(1400);
  onTick?.("confirming");
  await delay(900);
  onTick?.("done");
  return {
    status: "SUCCESS",
    receipt: randomId("MP"),
    confirmedAt: new Date().toISOString(),
  };
}
