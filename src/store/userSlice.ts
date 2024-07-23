import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserAnalysis {
  transcript: string;
  timestamp: string;
  analysis: string;
  score: number;
}

interface UserState {
  analyses: UserAnalysis[];
}

const initialState: UserState = {
  analyses: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    saveUserAnalysis: (state, action: PayloadAction<UserAnalysis>) => {
      state.analyses.push(action.payload);
    },
    clearUserAnalyses: (state) => {
      state.analyses = [];
    },
  },
});

export const { saveUserAnalysis, clearUserAnalyses } = userSlice.actions;

export default userSlice.reducer;
