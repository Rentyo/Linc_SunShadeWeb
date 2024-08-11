import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  owners: [],
};
const ownerSlice = createSlice({
  name: "sliceOwner",
  initialState,
  reducers: {
    insertOwner: (state, action) => {
      state.owners.push(action.payload);
    },
  },
});

export const ownerActions = ownerSlice.actions;
export default ownerSlice.reducer;
