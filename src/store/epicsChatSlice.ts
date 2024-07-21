import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  role: string;
  message: string;
}

interface ChatState {
  activeEpicsChat: string; 
  epicsMessages: Record<string, Message[]>;
}

const initialState: ChatState = {
  activeEpicsChat: 'ramayan',
  epicsMessages: {
    ramayan: [],
    mahabharat: [],
    puranasChat: []
  }
};

const epicsChatSlice = createSlice({
  name: 'epicsChat',
  initialState,
  reducers: {
    setActiveEpicsChat(state, action: PayloadAction<string>) {
      state.activeEpicsChat = action.payload;
    },
    setEpicsMessages(state, action: PayloadAction<{ chatType: string, messages: Message[] }>) {
      state.epicsMessages[action.payload.chatType] = action.payload.messages;
    },
    addEpicsMessage(state, action: PayloadAction<{ chatType: string, message: Message }>) {
      state.epicsMessages[action.payload.chatType].push(action.payload.message);
    },
    clearEpicsMessages(state, action: PayloadAction<string>) {
      state.epicsMessages[action.payload] = [];
    },
    clearAllEpicsMessages(state) {
      state.epicsMessages.ramayan = [];
      state.epicsMessages.mahabharat = [];
      state.epicsMessages.puranas = [];
    }
  }
});

export const { setActiveEpicsChat, setEpicsMessages, addEpicsMessage, clearEpicsMessages, clearAllEpicsMessages } = epicsChatSlice.actions;
export default epicsChatSlice.reducer;
