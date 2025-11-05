"use client";

import { useEffect, useRef, useState } from "react";
import { ChatBubble } from "../components/ChatBubble";
import { examplePrompts } from "../data/examples";
import type { AgentResponse, ChatMessage } from "../types/chat";

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your McDonald's assistant. Ask me about menu items, nutrition, or start an order." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(message?: string) {
    const content = (message ?? input).trim();
    if (!content) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = (await res.json()) as AgentResponse;
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, suggestions: data.suggestions, order: data.order }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I had trouble responding. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-4 shadow">
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full border px-3 py-1 text-sm hover:bg-neutral-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div ref={listRef} className="h-[60vh] overflow-y-auto rounded-2xl border bg-white p-4 shadow">
        <div className="grid gap-4">
          {messages.map((m, i) => (
            <ChatBubble key={i} message={m} onSuggestionClick={(s) => send(s)} />
          ))}
          {loading && <ChatBubble message={{ role: "assistant", content: "Thinking?" }} />}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Big Mac calories, breakfast times, or add items to your order?"
          className="flex-1 rounded-xl border bg-white px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-mcd-red/50"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-mcd-red px-5 py-3 font-semibold text-white shadow hover:bg-red-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
