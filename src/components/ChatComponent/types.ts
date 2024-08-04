export interface ChatProps {
  chatType: string;
}

export interface Message {
  role: string;
  message: string;
  audioUrl?: string;
}
