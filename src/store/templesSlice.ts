import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Temple {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface TemplesState {
  temples: Temple[];
  loading: boolean;
  error: string | null;
}

const initialState: TemplesState = {
  temples: [],
  loading: false,
  error: null,
};

export const fetchTemples = createAsyncThunk('temples/fetchTemples', async () => {
  const templesCollection = collection(db, 'temples');
  const templesSnapshot = await getDocs(templesCollection);
  const templesList = templesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Temple[];
  return templesList;
});

const templesSlice = createSlice({
  name: 'temples',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemples.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemples.fulfilled, (state, action) => {
        state.temples = action.payload;
        state.loading = false;
      })
      .addCase(fetchTemples.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch temples';
      });
  },
});

export default templesSlice.reducer;
export type { Temple };

// Ensure the file is recognized as a module
export {};
