import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3600);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[92%] max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-riseIn pointer-events-auto flex items-center gap-2.5 rounded-xl border border-pitch-line bg-pitch-card/95 backdrop-blur px-4 py-3 shadow-lg shadow-black/40"
          >
            {t.type === "success" && <CheckCircle2 size={18} className="text-gold shrink-0" />}
            {t.type === "error" && <XCircle size={18} className="text-coral shrink-0" />}
            {t.type === "info" && <Info size={18} className="text-mute shrink-0" />}
            <p className="text-sm text-chalk font-medium leading-snug">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
