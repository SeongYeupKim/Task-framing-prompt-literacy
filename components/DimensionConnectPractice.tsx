"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type ConnectExample = { id: string; prompt: string };

type DimensionLabel = { key: string; title: string };

type Props = {
  dimensions: DimensionLabel[];
  examples: ConnectExample[];
  matching: Record<string, string>;
  setMatching: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

export function DimensionConnectPractice({
  dimensions,
  examples,
  matching,
  setMatching,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [selectedDim, setSelectedDim] = useState<string | null>(null);
  const [paths, setPaths] = useState<string[]>([]);

  const pairs = useMemo(
    () =>
      dimensions
        .map((d) => ({ fromKey: d.key, toId: matching[d.key] }))
        .filter((p): p is { fromKey: string; toId: string } => Boolean(p.toId)),
    [dimensions, matching],
  );

  const updateLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cr = container.getBoundingClientRect();
    const next: string[] = [];
    for (const { fromKey, toId } of pairs) {
      const L = leftRefs.current[fromKey];
      const R = rightRefs.current[toId];
      if (!L || !R) continue;
      const lr = L.getBoundingClientRect();
      const rr = R.getBoundingClientRect();
      const x1 = lr.right - cr.left;
      const y1 = lr.top - cr.top + lr.height / 2;
      const x2 = rr.left - cr.left;
      const y2 = rr.top - cr.top + rr.height / 2;
      const mid = (x1 + x2) / 2;
      next.push(
        `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`,
      );
    }
    setPaths(next);
  }, [pairs]);

  useLayoutEffect(() => {
    updateLines();
    const c = containerRef.current;
    if (!c) return;
    const ro = new ResizeObserver(updateLines);
    ro.observe(c);
    window.addEventListener("resize", updateLines);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateLines);
    };
  }, [updateLines, examples]);

  function onDimensionActivate(key: string) {
    setSelectedDim((s) => (s === key ? null : key));
  }

  function onExampleActivate(exampleId: string) {
    if (selectedDim) {
      setMatching((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          if (next[k] === exampleId) delete next[k];
        }
        next[selectedDim] = exampleId;
        return next;
      });
      setSelectedDim(null);
      return;
    }
    setMatching((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (next[k] === exampleId) delete next[k];
      }
      return next;
    });
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl border-2 border-student-border bg-white p-4 sm:p-5"
    >
      <svg
        className="pointer-events-none absolute inset-0 z-10 hidden h-full min-h-full w-full overflow-visible lg:block"
        aria-hidden
      >
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="rgb(13 148 136)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
      </svg>

      <p className="mb-4 text-sm font-medium leading-relaxed text-student-ink lg:hidden">
        Tap a dimension, then an example to connect. Tap an example again on its
        own to clear that line.
      </p>
      <p className="mb-4 hidden text-sm font-medium leading-relaxed text-student-muted lg:block">
        Click a dimension, then the example it best matches. Each example is
        used once. Click a connected example without a dimension selected to
        remove that link.
      </p>

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="space-y-3">
          {dimensions.map((dim) => {
            const linked = matching[dim.key];
            const isSel = selectedDim === dim.key;
            return (
              <div
                key={dim.key}
                ref={(el) => {
                  leftRefs.current[dim.key] = el;
                }}
                role="button"
                tabIndex={0}
                onClick={() => onDimensionActivate(dim.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onDimensionActivate(dim.key);
                  }
                }}
                className={`min-h-[3rem] cursor-pointer rounded-lg border-2 bg-white px-3 py-3 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isSel
                    ? "border-teal-600 ring-2 ring-teal-400"
                    : linked
                      ? "border-teal-700 bg-teal-50/70"
                      : "border-student-border hover:border-teal-300"
                }`}
              >
                <span className="text-sm font-medium text-student-ink sm:text-base">
                  {dim.title}
                </span>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          {examples.map((ex, idx) => {
            const n = idx + 1;
            const isLinked = dimensions.some((d) => matching[d.key] === ex.id);
            return (
              <div
                key={ex.id}
                ref={(el) => {
                  rightRefs.current[ex.id] = el;
                }}
                role="button"
                tabIndex={0}
                onClick={() => onExampleActivate(ex.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onExampleActivate(ex.id);
                  }
                }}
                className={`min-h-[3rem] cursor-pointer rounded-lg border-2 bg-white px-3 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isLinked
                    ? "border-teal-700 bg-teal-50/70"
                    : "border-student-border hover:border-teal-300"
                }`}
              >
                <div className="text-sm font-medium text-student-ink sm:text-base">
                  Example {n}
                </div>
                <p className="mt-1 text-xs font-medium leading-snug text-student-ink/90 sm:text-sm">
                  {ex.prompt}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
