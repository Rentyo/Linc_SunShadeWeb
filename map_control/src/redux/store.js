import { configureStore } from "@reduxjs/toolkit";
import deviceReducer from "./deviceSlice";
import ownerReducer from "./ownerSlice"
import mapReducer from "./mapSlice"

const store = configureStore({
  reducer: {
    devices: deviceReducer,
    owners : ownerReducer,
    map : mapReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    immutableCheck: false,
    serializableCheck: false,
  })
});

export default store;
