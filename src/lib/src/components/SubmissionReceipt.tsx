"use client";

import { useEffect, useState } from "react";
import { RegistryCard, RegistryCardData } from "@/components/RegistryCard";
import { LAST_SUBMISSION_KEY } from "@/components/UploadForm";

/**
 * Shows the card the candidate just filed, read from this browser tab's
 * session. If it isn't available (page opened directly), a generic card is
 * shown instead.
 */
export function SubmissionReceipt() {
  const [data, setData] = useState<RegistryCardData | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_SUBMISSION_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {
      /* fall back to the generic card */
    }
  }, []);

  const firstName = data?.fullName?.split(/\s+/)[0];

  return (
    <>
      <h1 className="text-balance font-display text-4xl font-extrabold tracking-[-0.025em] text-white sm:text-5xl">
        {firstName ? `${firstName}, your CV is on file` : "Your CV is on file"}
      </h1>
      <div className="mx-auto mt-10 w-full max-w-[360px] text-left">
        <RegistryCard data={data ?? {}} stamped animateStamp />
      </div>
    </>
  );
}
