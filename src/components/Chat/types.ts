
export interface ChatProps {
  templeId: string;
  templeName: string;
  initialMessages: { role: string; text: string }[];
  setMessages: React.Dispatch<React.SetStateAction<{ role: string; text: string }[]>>;
}

export interface ChatResponse {
  message: string;
}
