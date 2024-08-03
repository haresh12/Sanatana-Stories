export interface Message {
  id: string;
  user: string;
  name: string;
  text: string;
  timestamp: any;
  attribute_scores?: {
    TOXICITY?: number;
    SEVERE_TOXICITY?: number;
    IDENTITY_ATTACK?: number;
    INSULT?: number;
    PROFANITY?: number;
    THREAT?: number;
  };
}
