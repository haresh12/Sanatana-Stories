import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
    role: string;
    message: string;
}

interface ChatState {
    godName: string;
    messages: Message[];
    gods: God[];
}

interface God {
    id: string;
    name: string;
    description: string;
    image: string;
}

const initialState: ChatState = {
    godName: '',
    messages: [],
    gods: [],
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setGodName(state, action: PayloadAction<string>) {
            state.godName = action.payload;
        },
        setMessages(state, action: PayloadAction<Message[]>) {
            state.messages = action.payload;
        },
        addMessage(state, action: PayloadAction<Message>) {
            state.messages.push(action.payload);
        },
        setGods(state, action: PayloadAction<God[]>) {
            state.gods = action.payload;
        },
        clearGods(state) {
            state.gods = [];
        },
        clearChat(state) {
            state.godName = '';
            state.messages = [];
        },
    },
});

export const { setGodName, setMessages, addMessage, setGods, clearChat, clearGods } = chatSlice.actions;
export default chatSlice.reducer;
