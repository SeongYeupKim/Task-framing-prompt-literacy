"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/types/study";
import { GENAI_TASK } from "@/lib/studyContent";

type Props = {
  /** Controlled message list (saved to Firestore by parent). */
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  onContinueToEssay: () => void;
};

export function GenAIInteractionPanel({
  messages,
  onMessagesChange,
  onContinueToEssay,
}: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const next = [...messages, userMsg];
    onMessagesChange(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.message as string,
        createdAt: new Date().toISOString(),
      };
      onMessagesChange([...next, assistantMsg]);
      setTimeout(scrollToBottom, 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[min(70vh,640px)] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">
          {GENAI_TASK.title}
        </h2>
        <p className="text-xs text-slate-600">
          Chat with the assistant. You may send as many messages as you need.
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            Type your first message below to start (e.g., ask for an outline or
            clarify concepts for your essay).
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-2 text-sm ${
                m.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-900"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <p className="text-xs text-slate-500">Assistant is thinking…</p>
        )}
        <div ref={bottomRef} />
      </div>
      {error && (
        <p className="px-4 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="border-t border-slate-100 p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={2}
            className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Write your prompt… (Enter to send, Shift+Enter for newline)"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading || !input.trim()}
            className="self-end rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <button
          type="button"
          onClick={onContinueToEssay}
          className="mt-3 w-full rounded-lg border border-slate-300 bg-slate-50 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
        >
          I’m done chatting — continue to essay
        </button>
      </div>
    </div>
  );
}
