//디바이스 통신 부분을 여기다가 추가하면 될 거 같음
export const controlDevice = (device_ip, option ,on_off ) => {
    const control_power = on_off ? "차양막을 접습니다" : "차양막을 펼칩니다"
    
    console.log(device_ip, option, control_power);

    
}
