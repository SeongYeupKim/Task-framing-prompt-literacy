"use client";

import { useEffect, useState } from "react";
import { InformedConsentScreen } from "@/components/InformedConsentScreen";
import { HomeLanding } from "@/components/HomeLanding";
import { readConsentAccepted, writeConsentAccepted } from "@/lib/consentStorage";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [consented, setConsented] = useState(false);
  const [fromAuth, setFromAuth] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsented(readConsentAccepted());
    setFromAuth(
      typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("from") === "auth",
    );
  }, []);

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-student-canvas">
        <p className="text-sm font-medium text-student-muted">Loading…</p>
      </main>
    );
  }

  if (!consented) {
    return (
      <>
        {fromAuth && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-950">
            Please read the consent form below, then continue to sign in or
            register.
          </div>
        )}
        <InformedConsentScreen
          onAccepted={() => {
            writeConsentAccepted();
            setConsented(true);
          }}
        />
      </>
    );
  }

  return <HomeLanding />;
}
