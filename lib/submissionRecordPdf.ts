import type { ChatMessage } from "@/types/study";

function pdfSafe(value: string): string {
  return value
    .replace(/\u2018|\u2019|\u2032/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x09\x0a\x0d\x20-\xff]/g, "");
}

function stampForFilename(iso: string): string {
  return iso.replace(/[:.]/g, "-").slice(0, 19);
}

/** Student-facing proof file: essay and chat history only. */
export async function downloadSubmissionRecord(opts: {
  email: string;
  essay: string;
  messages: ChatMessage[];
}): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 54;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;
  const generatedAt = new Date().toISOString();

  function newPage() {
    doc.addPage();
    y = margin;
  }

  function ensure(height: number) {
    if (y + height > pageHeight - margin) newPage();
  }

  function writeLines(text: string, size: number, gap: number) {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(pdfSafe(text), maxWidth) as string[];
    const lineHeight = size + gap;
    for (const line of lines) {
      ensure(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }
  }

  doc.setFont("times", "bold");
  writeLines("Assignment record", 16, 4);
  doc.setFont("times", "normal");
  y += 6;
  writeLines(
    "Upload this file to Canvas as proof that you completed the assignment in the study system. It contains your essay and your chat history only.",
    11,
    3,
  );
  y += 8;
  writeLines(`Account: ${opts.email || "(no email on file)"}`, 11, 3);
  writeLines(`Generated: ${generatedAt}`, 11, 3);

  y += 14;
  doc.setFont("times", "bold");
  writeLines("Essay", 14, 4);
  doc.setFont("times", "normal");
  y += 4;
  writeLines(opts.essay.trim() || "(No essay text was saved.)", 11, 4);

  y += 16;
  doc.setFont("times", "bold");
  writeLines("Chat history", 14, 4);
  doc.setFont("times", "normal");
  y += 4;
  if (opts.messages.length === 0) {
    writeLines("(No chat messages were saved.)", 11, 4);
  } else {
    opts.messages.forEach((message, index) => {
      const who = message.role === "user" ? "You" : "Chatbot";
      y += 8;
      doc.setFont("times", "bold");
      writeLines(`${index + 1}. ${who}  ${message.createdAt}`, 11, 3);
      doc.setFont("times", "normal");
      writeLines(message.content || "(empty message)", 11, 4);
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 28, {
      align: "right",
    });
  }

  doc.save(`assignment-record-${stampForFilename(generatedAt)}.pdf`);
}
