import { NextRequest, NextResponse } from "next/server";
import menu from "../../../data/menu.json";
import nutrition from "../../../data/nutrition.json";
import type { AgentResponse, ChatMessage, OrderState } from "../../../types/chat";

function createEmptyOrder(): OrderState {
  return { items: [], subtotal: 0 };
}

function addToOrder(order: OrderState, name: string, price: number, size?: string) {
  const existing = order.items.find((i) => i.name === name && i.size === size);
  if (existing) existing.quantity += 1; else order.items.push({ name, price, quantity: 1, size });
  order.subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
}

function findMenuItem(query: string) {
  const q = query.toLowerCase();
  let best: { name: string; price: number; size?: string; score: number } | null = null;
  for (const section of menu.sections) {
    for (const item of section.items) {
      const name = item.name.toLowerCase();
      const score = name === q ? 3 : name.includes(q) ? 2 : q.split(" ").filter((w) => name.includes(w)).length > 0 ? 1 : 0;
      if (score > 0) {
        const price = typeof item.price === "number" ? item.price : Math.min(...Object.values(item.price));
        const candidate = { name: item.name, price, score };
        if (!best || score > best.score) best = candidate as any;
      }
    }
  }
  return best ? { name: best.name, price: best.price } : null;
}

function getNutrition(name: string) {
  const key = name.toLowerCase();
  return nutrition.items.find((n) => n.name.toLowerCase() === key);
}

function suggestFollowUps(): string[] {
  return [
    "Show popular burgers",
    "What are breakfast hours?",
    "Add a Big Mac to my order",
    "How many calories in a McFlurry?",
    "View my order",
  ];
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { messages: ChatMessage[] };
  const messages = body.messages ?? [];
  const last = messages[messages.length - 1];

  let order: OrderState = messages.find((m) => m.order)?.order ?? createEmptyOrder();

  let reply = "";
  let suggestions: string[] = [];

  const text = (last?.content ?? "").toLowerCase();

  // Simple intents
  if (/^hi|hello|hey/.test(text)) {
    reply = "Hi! I can help with menu, nutrition, and orders. What would you like?";
  } else if (/popular|recommend|best/.test(text)) {
    reply = "Here are some popular picks: Big Mac, Quarter Pounder with Cheese, McNuggets (10pc), World Famous Fries, Oreo McFlurry.";
    suggestions = ["Add Big Mac", "Add 10pc McNuggets", "Calories for Fries"];
  } else if (/breakfast.*(time|hour)|when.*breakfast/.test(text)) {
    reply = "Most locations serve breakfast from 5:00 AM to 10:30 AM on weekdays, and until 11:00 AM on weekends. Hours vary by location.";
    suggestions = ["Find a nearby location", "Show breakfast menu"];
  } else if (/show .*menu|breakfast menu|burger menu|dessert menu|menu/.test(text)) {
    const sec = menu.sections.map((s) => `- ${s.name}`).join("\n");
    reply = `Our menu sections:\n${sec}`;
    suggestions = ["Show burgers", "Show breakfast", "Show desserts"];
  } else if (/show (burgers|burger)/.test(text)) {
    const sec = menu.sections.find((s) => /burger/i.test(s.name));
    reply = sec ? `Burgers: ${sec.items.map((i) => `${i.name} ($${typeof i.price === "number" ? i.price.toFixed(2) : Math.min(...Object.values(i.price)).toFixed(2)})`).join(", ")}` : "Here are some burgers: Big Mac, Quarter Pounder with Cheese, Cheeseburger.";
    suggestions = ["Add Big Mac", "Calories for Big Mac", "Add Fries"];
  } else if (/add |i'?ll take|i want|order /.test(text)) {
    const item = findMenuItem(text.replace(/add |order |i want |i'll take /g, ""));
    if (item) {
      addToOrder(order, item.name, item.price);
      reply = `${item.name} added to your order. Anything else?`;
      suggestions = ["Add Fries", "Add Coke", "Checkout"];
    } else {
      reply = "I couldn't find that item. Try 'Add Big Mac' or 'Add Fries'.";
      suggestions = suggestFollowUps();
    }
  } else if (/calorie|nutrition|how many.*cal/.test(text)) {
    const words = text.replace(/\?/g, "").split(/\s+/);
    let found: any = null;
    for (let i = 0; i < words.length; i++) {
      const candidate = words.slice(i).join(" ");
      const item = getNutrition(candidate);
      if (item) { found = item; break; }
    }
    if (!found) {
      // try fuzzy by menu match
      const item = findMenuItem(text);
      if (item) found = getNutrition(item.name);
    }
    if (found) {
      reply = `${found.name}: ${found.calories} cal, Protein ${found.protein}g, Carbs ${found.carbs}g, Fat ${found.fat}g.`;
      suggestions = ["Add to order", "Compare with Fries", "Show ingredients"];
    } else {
      reply = "I couldn't locate nutrition info for that. Try 'Big Mac calories'.";
      suggestions = suggestFollowUps();
    }
  } else if (/view.*order|my order|cart|checkout/.test(text)) {
    if (order.items.length === 0) {
      reply = "Your order is empty. Try adding a Big Mac or Fries.";
      suggestions = ["Add Big Mac", "Add Fries", "Add Coke"];
    } else {
      reply = "Here's your current order.";
      suggestions = ["Add Fries", "Remove last item", "Clear order"];
    }
  } else if (/remove|undo|delete/.test(text)) {
    if (order.items.length) {
      order.items.pop();
      order.subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
      reply = "Removed the last item from your order.";
      suggestions = ["View my order", "Add Fries", "Checkout"];
    } else {
      reply = "There's nothing to remove.";
      suggestions = suggestFollowUps();
    }
  } else if (/clear.*order|start over|reset/.test(text)) {
    order = createEmptyOrder();
    reply = "Your order has been cleared.";
    suggestions = ["Add Big Mac", "Add Fries", "Add Coke"];
  } else if (/find.*(store|location|nearby)|near me|closest/.test(text)) {
    reply = "Use the official store locator: https://www.mcdonalds.com/store-locator. Live location search is not enabled in this demo.";
    suggestions = ["Breakfast hours", "Popular items", "Add Big Mac"];
  } else {
    // fallback: try to add or give info
    const item = findMenuItem(text);
    if (item) {
      reply = `I found ${item.name}. Would you like to add it for $${item.price.toFixed(2)}?`;
      suggestions = ["Add to order", "Calories", "Add Fries"];
    } else {
      reply = "I can help with menu, nutrition, and orders. Try: 'Show burgers', 'Big Mac calories', or 'Add Fries'.";
      suggestions = suggestFollowUps();
    }
  }

  const response: AgentResponse = { reply, suggestions, order };
  return NextResponse.json(response);
}
