export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  order?: OrderState;
};

export type OrderItem = {
  name: string;
  price: number;
  quantity: number;
  size?: string;
};

export type OrderState = {
  items: OrderItem[];
  subtotal: number;
};

export type AgentResponse = {
  reply: string;
  suggestions: string[];
  order: OrderState;
};
