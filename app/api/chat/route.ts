import OpenAI from "openai";
import { NextResponse } from "next/server";

const SYSTEM = `You are ChatGPT helping a student complete a science class assignment. The student must write an explanatory essay on: "How Does Physical Exercise Influence Learning and Academic Performance?"

Help them develop ideas that are accurate and well-structured. Do not write the entire final essay for them unless they explicitly ask for a draft to edit—prefer coaching, outlines, feedback, and shorter examples. If they ask for a full draft, you may provide one they can revise.

Remind them their final submission should meet their instructor's criteria (accuracy, integration of physiology and behavior, causal and conditional reasoning, audience-appropriate language, two examples, ~300 words, essay form).`;

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

    const text = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ message: text, model });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Chat completion failed" },
      { status: 500 }
    );
  }
}
