import type { ChatMessage } from "../types/chat";

export function ChatBubble({ message, onSuggestionClick }: { message: ChatMessage; onSuggestionClick?: (s: string) => void }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm shadow ${
          isUser ? "bg-mcd-red text-white" : "bg-neutral-100"
        }`}
      >
        {message.content}
        {message.order && (
          <div className="mt-3 rounded-xl bg-white p-3 text-neutral-800">
            <div className="mb-1 text-xs font-semibold">Your order</div>
            <ul className="list-inside list-disc text-sm">
              {message.order.items.map((it, idx) => (
                <li key={idx}>{it.quantity}? {it.name} {it.size ? `(${it.size})` : ""} ? ${it.price.toFixed(2)}</li>
              ))}
            </ul>
            <div className="mt-2 text-right text-sm font-semibold">Subtotal: ${message.order.subtotal.toFixed(2)}</div>
          </div>
        )}
        {!!message.suggestions?.length && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestionClick?.(s)}
                className="rounded-full border bg-white px-3 py-1 text-xs hover:bg-neutral-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
