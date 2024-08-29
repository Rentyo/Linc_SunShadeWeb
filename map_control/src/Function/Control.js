//디바이스 통신 부분을 여기다가 추가하면 될 거 같음
export const controlDevice = async (device_ip, option ,on_off ) => {
    const control_power = on_off ? "차양막을 접습니다" : "차양막을 펼칩니다"

    var inputData = () => {
        switch(option){
            case 'sunshade_power' : return { inputName :'powerValue' , inputValue : on_off ? '2' : '1' } 
            case 'led_power' : return { inputName :'ledValue' , inputValue : on_off ? '4' : '3' }
            case 'led2_power' : return { inputName :'led2Value' , inputValue : on_off ? '6' : '5' }
            default : return ''
        }
    }
    var data = inputData()
    var formData = {};
    formData[data.inputName] = data.inputValue
    
    try {
        console.log(formData)
        // const response = await fetch("/URL", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(formData),
        // });
        // if (response.ok) {
        //   const dataOwner = await response.json();
        //   console.log(dataOwner)
        // } else {
        //   console.error('Network response was not ok:', response.statusText);
        // }
      } catch (error) {
        console.error('Error:', error);
      } 

    
}
