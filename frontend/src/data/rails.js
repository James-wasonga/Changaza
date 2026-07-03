// Pluggable local-payment-rail registry. M-Pesa is the live proof of concept;
// the rest are declared here so adding a new market is a data change, not a rewrite.
export const RAILS = [
  { id: "mpesa", label: "M-Pesa", country: "Kenya", flag: "🇰🇪", currency: "KES", status: "live" },
  { id: "momo", label: "MTN MoMo", country: "Nigeria / Ghana", flag: "🇳🇬", currency: "NGN", status: "soon" },
  { id: "gcash", label: "GCash", country: "Philippines", flag: "🇵🇭", currency: "PHP", status: "soon" },
  { id: "upi", label: "UPI", country: "India", flag: "🇮🇳", currency: "INR", status: "soon" },
  { id: "pix", label: "Pix", country: "Brazil", flag: "🇧🇷", currency: "BRL", status: "soon" },
];

export const LIVE_RAIL = RAILS[0];
