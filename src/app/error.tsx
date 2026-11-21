"use client";

import { useEffect } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <PageShell>
      <div className="mx-auto mt-10 max-w-xl rotate-1 border-[3px] border-ink bg-coral p-8 shadow-brutal-lg">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">ink spill</p>
        <h1 className="mt-2 text-5xl font-extrabold uppercase">Something smudged.</h1>
        <p className="mt-3 font-hand text-2xl font-bold">this page hit an error. try again, or flip back to the cover.</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={reset} variant="paper">
            Try again
          </Button>
          <ButtonLink href="/" variant="sun">
            Cover
          </ButtonLink>
        </div>
      </div>
    </PageShell>
  );
}
