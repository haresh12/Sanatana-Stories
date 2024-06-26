// src/store/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';

interface AuthState {
  currentUser: User | null;
  name : string | null
}

const initialState: AuthState = {
  currentUser: null,
  name : "",

};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.currentUser = action.payload;
    },
    setName(state, action: PayloadAction<string | null>) {
      state.name = action.payload;
    },
    logout(state) {
      state.currentUser = null;
    },
  },
});

export const { setUser, logout, setName } = authSlice.actions;
export default authSlice.reducer;
