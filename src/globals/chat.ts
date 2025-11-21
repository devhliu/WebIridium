import { atom } from "jotai";
import { saveAtom } from "./saving";

export const apiKeyAtom = atom<string | null>(null);

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
