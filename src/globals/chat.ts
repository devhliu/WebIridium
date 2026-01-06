import { atom } from "jotai";
import { saveAtom } from "./saving";

export const apiKeyAtom = atom<string | null>(null);

export const DEFAULT_SYSTEM_PROMPT =
  "You are a systems biologist that specializes in a biological compound and reaction modeling language named Antimony that is based off of SBML, help the user debug and analyze their models that are written in Antimony";

export const systemPromptAtom = atom<string>(DEFAULT_SYSTEM_PROMPT);

export const AVAILABLE_MODELS = [
  { id: "gpt-5.2", name: "GPT-5.2" },
  { id: "gpt-5.1", name: "GPT-5.1" },
  { id: "gpt-5", name: "GPT-5" },
  { id: "gpt-5-mini", name: "GPT-5 mini" },
  { id: "gpt-5-nano", name: "GPT-5 nano" },
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
];

export const modelAtom = atom<string>("gpt-4o");

export type ChatRole = "user" | "llm";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

export interface ChatConversation {
  id: string;
  title?: string;
  messages: ChatMessage[];
  unixTimestampMs: number;
}

const MAX_CHAT_HISTORY = 100;

const _chatHistoryAtom = atom<ChatConversation[]>([]);

export const updateAllChatHistoryAtom = atom(
  null,
  (_get, set, history: ChatConversation[]) => {
    set(_chatHistoryAtom, history);
  },
);

export const chatHistoryAtom = atom((get) => get(_chatHistoryAtom));

// Active conversation selected for loading into the chat panel
export const activeConversationAtom = atom<ChatConversation | null>(null);

export const upsertActiveConversationAtom = atom(
  null,
  (
    get,
    set,
    { messages, title }: { messages: ChatMessage[]; title?: string },
  ) => {
    const history = get(_chatHistoryAtom);
    const active = get(activeConversationAtom);

    if (active) {
      // update existing conversation in place
      const updated: ChatConversation = {
        ...active,
        messages,
        title: title ?? active.title,
      };

      const newHistory = history.map((c) => (c.id === active.id ? updated : c));
      set(_chatHistoryAtom, newHistory);
      set(activeConversationAtom, updated);
    } else {
      // create new conversation
      const record: ChatConversation = {
        id: String(Date.now()),
        title: title ?? `Conversation `,
        messages,
        unixTimestampMs: Date.now(),
      };

      const remaining =
        history.length >= MAX_CHAT_HISTORY ? history.slice(1) : history;
      const newHistory = [...remaining, record];
      set(_chatHistoryAtom, newHistory);
      set(activeConversationAtom, record);
    }

    // persist
    void set(saveAtom);
  },
);
