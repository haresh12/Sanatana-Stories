// src/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';

interface AuthState {
  currentUser: User | null;
  name: string | null;
  hasSeenRules: boolean;
}

const initialState: AuthState = {
  currentUser: null,
  name: null,
  hasSeenRules: false,  
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    setName: (state, action: PayloadAction<string | null>) => {
      state.name = action.payload;
    },
    setHasSeenRules: (state, action: PayloadAction<boolean>) => {
      state.hasSeenRules = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.name = null;
      state.hasSeenRules = false;
    },
  },
});

export const { setUser, setName, setHasSeenRules, logout } = authSlice.actions;

export default authSlice.reducer;
