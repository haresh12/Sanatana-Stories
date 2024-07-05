import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';

interface ChalisaState {
  selectedText: string;
  meaning: string;
  loading: boolean;
  savedMeanings: { [word: string]: string };
}

const initialState: ChalisaState = {
  selectedText: '',
  meaning: '',
  loading: false,
  savedMeanings: {},
};

export const fetchMeaning = createAsyncThunk('chalisa/fetchMeaning', async (word: string) => {
  const getMeaning = httpsCallable<{ text: string }, { meaning: string }>(functions, 'getMeaning');
  const response = await getMeaning({ text: word });
  return response.data.meaning;
});

const chalisaSlice = createSlice({
  name: 'chalisa',
  initialState,
  reducers: {
    setSelectedText(state, action: PayloadAction<string>) {
      state.selectedText = action.payload;
    },
    setMeaning(state, action: PayloadAction<string>) {
      state.meaning = action.payload;
    },
    saveMeaning(state, action: PayloadAction<{ word: string; meaning: string }>) {
      state.savedMeanings[action.payload.word] = action.payload.meaning;
    },
    clearMeaning(state, action: PayloadAction<string>) {
      delete state.savedMeanings[action.payload];
    },
    reset(state) {
      state.selectedText = '';
      state.meaning = '';
      state.loading = false;
      state.savedMeanings = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeaning.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMeaning.fulfilled, (state, action) => {
        state.loading = false;
        state.meaning = action.payload;
      })
      .addCase(fetchMeaning.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setSelectedText, setMeaning, saveMeaning, clearMeaning, reset } = chalisaSlice.actions;
export default chalisaSlice.reducer;
