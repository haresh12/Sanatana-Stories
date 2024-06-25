import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
    role: string;
    message: string;
}

interface God {
    id: string;
    name: string;
    image: string;
    description: string;
}

interface ChatState {
    godName: string;
    messages: Message[];
    gods: God[];
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
        setGods: (state, action: PayloadAction<God[]>) => {
            state.gods = action.payload;
        },
        setMessages(state, action: PayloadAction<Message[]>) {
            state.messages = action.payload;
        },
        addMessage(state, action: PayloadAction<Message>) {
            state.messages.push(action.payload);
        },
        setGods: (state, action: PayloadAction<God[]>) => {
            state.gods = action.payload;
        },
        clearChat(state) {
            state.godName = '';
            state.messages = [];
        },
    },
});

export const { setGodName, setMessages, addMessage, clearChat, setGods, clearGods } = chatSlice.actions;
export default chatSlice.reducer;
