"use client";

import { useEffect, useState } from "react";
import Markdown from "./Markdown";

interface Props {
  experimentId: string;
  versionNumber: number;
  initialReview?: string;
}

export default function PhDReviewPanel({ experimentId, versionNumber, initialReview }: Props) {
  const [review, setReview] = useState<string | null>(initialReview ?? null);
  const [polling, setPolling] = useState(!initialReview);

  useEffect(() => {
    if (review) return;

    let cancelled = false;
    let delay = 3000;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch(
          `/api/experiments/${experimentId}/versions/${versionNumber}/review`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.review) {
            if (!cancelled) {
              setReview(data.review);
              setPolling(false);
            }
            return;
          }
        }
      } catch {
        // retry on error
      }
      if (!cancelled) {
        delay = Math.min(delay * 1.5, 15000);
        setTimeout(poll, delay);
      }
    }

    const timer = setTimeout(poll, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [experimentId, versionNumber, review]);

  return (
    <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50">
      <div className="flex items-center gap-2 border-b border-amber-200 px-4 py-3">
        <span className="text-sm font-semibold text-amber-900">PhD Economist Review</span>
        {polling && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-amber-700">
            <svg
              className="h-3.5 w-3.5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx={12} cy={12} r={10} strokeOpacity={0.25} />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Review in progress…
          </span>
        )}
      </div>
      <div className="px-4 py-4">
        {review ? (
          <div className="prose prose-sm max-w-none prose-headings:text-amber-900 prose-headings:font-semibold prose-strong:text-amber-900">
            <Markdown>{review}</Markdown>
          </div>
        ) : (
          <p className="text-sm text-amber-700">
            A PhD-level critique is being generated. It will appear here in a moment.
          </p>
        )}
      </div>
    </div>
  );
}
