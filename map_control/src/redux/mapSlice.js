import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  map : null,
};
const mapSlice = createSlice({
  name: "sliceMap",
  initialState,
  reducers: {
    MapValue: (state, action) => {
      state.map = action.payload;
    },
  },
});

export const mapActions = mapSlice.actions;
export default mapSlice.reducer;
