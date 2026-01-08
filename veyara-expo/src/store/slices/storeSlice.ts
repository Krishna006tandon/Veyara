import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Store {
  id: string;
  name: string;
  address: string;
  rating: number;
  deliveryTime: string;
  image: string;
}

interface StoreState {
  stores: Store[];
  selectedStore: Store | null;
  loading: boolean;
  error: string | null;
}

const initialState: StoreState = {
  stores: [],
  selectedStore: null,
  loading: false,
  error: null,
};

const storeSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    setStores: (state, action: PayloadAction<Store[]>) => {
      state.stores = action.payload;
      state.error = null;
    },
    setSelectedStore: (state, action: PayloadAction<Store>) => {
      state.selectedStore = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setStores, setSelectedStore, setLoading, setError } = storeSlice.actions;
export default storeSlice.reducer;
