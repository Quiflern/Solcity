"use client";

import { Toaster as Sonner } from "sonner";

export default function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#111111",
          border: "1px solid rgba(208, 255, 20, 0.3)",
          color: "#ffffff",
          padding: "16px",
          fontSize: "14px",
          fontFamily: "var(--font-sans)",
        },
        className: "sonner-toast",
        descriptionClassName: "sonner-toast-description",
      }}
      theme="dark"
      richColors={false}
      closeButton={false}
    />
  );
}
