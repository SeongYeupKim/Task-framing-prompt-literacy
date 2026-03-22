/** Renders “Label: detail” with the label bold for scanability. */
export function TaskConditionLine({ text }: { text: string }) {
  const idx = text.indexOf(": ");
  if (idx === -1) {
    return (
      <span className="text-[0.9375rem] leading-relaxed text-student-ink">
        {text}
      </span>
    );
  }
  const label = text.slice(0, idx);
  const detail = text.slice(idx + 2);
  return (
    <span className="text-[0.9375rem] leading-relaxed text-student-ink">
      <span className="font-bold text-student-ink">{label}</span>
      {": "}
      <span className="text-student-ink/95">{detail}</span>
    </span>
  );
}
