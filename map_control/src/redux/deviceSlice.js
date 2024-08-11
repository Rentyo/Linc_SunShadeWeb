import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  devices: [],
};
const deviceSlice = createSlice({
  name: "sliceDevice",
  initialState,
  reducers: {
    insertDevice: (state, action) => {
      state.devices.push(action.payload);
    },
    on_sunshade_power: (state, action) => {
      const {
        device_num,
      } = action.payload;
      const devices = state.devices.find(
        (devices) => devices.device_num === device_num
      );
      if (devices && devices.sunshade_power === 0 ) {
        devices.sunshade_power = 1;
      }
    },
    off_sunshade_power: (state, action) => {
      const {
        device_num,
      } = action.payload;
      const devices = state.devices.find(
        (devices) => devices.device_num === device_num
      );
      if (devices && devices.sunshade_power === 1 ) {
        devices.sunshade_power = 0;
      }
    },
    on_led_power: (state, action) => {
      const {
        device_num,
      } = action.payload;
      const devices = state.devices.find(
        (devices) => devices.device_num === device_num
      );
      if (devices && devices.led_power === 0 ) {
        devices.led_power = 1;
      }
    },
    off_led_power: (state, action) => {
      const {
        device_num,
      } = action.payload;
      const devices = state.devices.find(
        (devices) => devices.device_num === device_num
      );
      if (devices && devices.led_power === 1 ) {
        devices.led_power = 0;
      }
    },
    on_led2_power: (state, action) => {
      const {
        device_num,
      } = action.payload;
      const devices = state.devices.find(
        (devices) => devices.device_num === device_num
      );
      if (devices && devices.led2_power === 0 ) {
        devices.led2_power = 1;
      }
    },
    off_led2_power: (state, action) => {
      const {
        device_num,
      } = action.payload;
      const devices = state.devices.find(
        (devices) => devices.device_num === device_num
      );
      if (devices && devices.led2_power === 1 ) {
        devices.led2_power = 0;
      }
    },
  },
});

export const deviceActions = deviceSlice.actions;
export default deviceSlice.reducer;
