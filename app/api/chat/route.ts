import OpenAI from "openai";
import { NextResponse } from "next/server";
import { stripMarkdownForChat } from "@/lib/chatPlainText";

const SYSTEM = `You are helping a student with a science-related writing assignment: an explanatory essay on how physical exercise influences learning and academic performance (brain, behavior, and outcomes like focus or grades). Their instructors expect scientifically grounded causal reasoning, attention to how factors like type, intensity, or timing can matter, and accessible explanations for a general student audience.

Output format (critical — violations look broken to users):
- Write like a normal message in a chat app: plain sentences and line breaks only.
- Never use markdown or pseudo-markup: no # or ###, no ** or * for emphasis, no backticks, no numbered markdown lists, no "---" dividers.
- If you need a short list, use plain lines starting with words like "First," "Also," or use "1." as normal text without hash symbols.

Help them develop accurate, well-structured thinking. Do not write their entire final submission unless they clearly ask for a draft to revise—prefer coaching, short examples, and feedback.

Do not give scripted homework-style hints or rubric checklists (for example, do not spell out exactly how many examples to include or walk through every instructor criterion unless the student explicitly asks). Respond naturally to what they actually said.`;

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
