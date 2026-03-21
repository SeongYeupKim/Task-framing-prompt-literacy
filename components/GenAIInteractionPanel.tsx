"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/types/study";

type Props = {
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  className?: string;
};

export function GenAIInteractionPanel({
  messages,
  onMessagesChange,
  className = "",
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
    <div
      className={`flex min-h-[min(78vh,820px)] flex-col overflow-hidden rounded-2xl border border-student-border bg-student-card shadow-student ${className}`}
    >
      <div className="border-b border-student-border bg-teal-50/50 px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-student-ink">
          Chat with the assistant
        </h2>
        <p className="mt-1 text-xs text-student-muted">
          Send as many messages as you need. Scroll up to reread earlier replies.
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col bg-student-canvas/40">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="rounded-xl bg-white/90 px-3 py-2 text-sm text-student-muted">
              Type a message below to start—for example, “Help me outline my
              essay” or “What’s one way exercise could affect attention?”
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-md bg-teal-600 text-white shadow-sm"
                    : "border border-student-border bg-white text-student-ink shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <p className="text-xs text-student-muted">Assistant is replying…</p>
          )}
          <div ref={bottomRef} />
        </div>
        {error && (
          <p
            className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}
        <div className="border-t border-student-border bg-white p-3 sm:p-4">
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
              rows={3}
              className="min-h-[4.5rem] flex-1 resize-y rounded-xl border border-student-border px-3 py-2.5 text-sm text-student-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              className="self-end rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
