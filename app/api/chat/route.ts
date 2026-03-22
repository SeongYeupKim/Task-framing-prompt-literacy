import OpenAI from "openai";
import { NextResponse } from "next/server";
import { stripMarkdownForChat } from "@/lib/chatPlainText";

const SYSTEM = `You are helping a student with a science class assignment: an explanatory essay on "How Does Physical Exercise Influence Learning and Academic Performance?"

Output format (critical — violations look broken to users):
- Write like a normal message in a chat app: plain sentences and line breaks only.
- Never use markdown or pseudo-markup: no # or ###, no ** or * for emphasis, no backticks, no numbered markdown lists, no "---" dividers.
- If you need a short list, use plain lines starting with words like "First," "Also," or use "1." as normal text without hash symbols.

Help them develop accurate, well-structured thinking. Do not write their entire final essay unless they clearly ask for a draft to revise—prefer coaching, short examples, and feedback.

Remind them briefly when useful that their essay should meet the instructor criteria (accuracy, physiology and behavior, causes and conditions, audience, two examples, ~300 words, essay form).`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const body = await req.json();
    const raw = body.messages as { role: string; content: string }[];
    if (!Array.isArray(raw) || raw.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = raw
      .filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    if (messages.length === 0) {
      return NextResponse.json({ error: "No valid messages" }, { status: 400 });
    }

    const model =
      process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "system", content: SYSTEM }, ...messages],
      temperature: 0.7,
    });

    const assistantRaw = completion.choices[0]?.message?.content ?? "";
    const text = stripMarkdownForChat(assistantRaw);
    return NextResponse.json({ message: text, model });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Chat completion failed" },
      { status: 500 }
    );
  }
}
