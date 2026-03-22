/**
 * Removes common markdown artifacts so chat reads like natural prose.
 * Used server-side on new replies, when persisting messages, and when displaying.
 */
export function stripMarkdownForChat(raw: string): string {
  let s = raw.replace(/\r\n/g, "\n");

  // Fenced code blocks → inner text only
  s = s.replace(/```[\s\S]*?```/g, (block) =>
    block.replace(/^```\w*\n?/, "").replace(/```$/, "").trim()
  );

  // ATX headings at line start (after newline or start of string)
  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/\n#{1,6}\s+/g, "\n");

  // __underline__
  s = s.replace(/__([^_]+)__/g, "$1");

  // **bold** / *italic* — repeat to peel nested pairs
  let prev = "";
  while (prev !== s) {
    prev = s;
    s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
    s = s.replace(/\*([^*\n]+)\*/g, "$1");
  }
  // Stray ** after paired removal
  s = s.replace(/\*\*/g, "");

  // Bullet lines
  s = s.replace(/^\s*[-*+]\s+/gm, "• ");

  return s.replace(/\n{3,}/g, "\n\n").trim();
}
