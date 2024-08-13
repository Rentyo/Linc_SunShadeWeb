import { useState, useEffect, useCallback } from "react";
import { Button,ButtonGroup } from "reactstrap";
import Logo from "./Logo";
import styles from "./Sidebar.module.css";
import styles_Full from "./FullLayout.module.css";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import {IoSearch} from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { deviceActions } from "../redux/deviceSlice";
import Modal from 'react-modal';
import Select from "react-select";
import * as controlFunction from "../Function/Control";
import { toast } from 'react-toastify';    

const Sidebar = () => {
  
  const devices = useSelector(
    (state) => state.devices.devices
  )
  const kakaomap = useSelector(
    (state) => state.map.map
  )
  const owners = useSelector(
    (state) =>  state.owners.owners
  )
  const dispatch = useDispatch();

  const [navItems, setNavItems] = useState([]);

  //검색 모달
  const [sModalIsOpen, setSModalIsOpen] = useState(false);
  const openSModal = () => setSModalIsOpen(true);
  const closeSModal = () => setSModalIsOpen(false);

  //다수 디바이스 제어 모달
  const [mModalIsOpen, setMModalIsOpen] = useState(false);
  const openMModal = () => {
    setSelectedMode(null);
    setMModalIsOpen(true);
  }
  const closeMModal = () => setMModalIsOpen(false);

  const [searchMarker , setMarkers] = useState(null);

  const [selectedIPs,setSelectedIPs] = useState([]);
  const [selectedMode, setSelectedMode] = useState(null);
  
  const showMobilemenu = () => {
    document
      .getElementById("sidebarArea")
      .classList.toggle(styles_Full.showSidebar);
  };

  const removeAllChildNods = (el) => {
    console.log(el)
    while (el.hasChildNodes()) {
      el.removeChild (el.lastChild);
  }
  }

  const displayPagination = (pagination) => {
    var paginationEl = document.getElementById('pagination'),
    fragment = document.createDocumentFragment(),
    i; 

  // 기존에 검색 다이얼로그에 추가된 페이지번호를 삭제합니다
  while (paginationEl.hasChildNodes()) {
      paginationEl.removeChild (paginationEl.lastChild);
  }

  for (i=1; i<=pagination.last; i++) {
      var el = document.createElement('a');
      el.href = "#";
      el.innerHTML = i;

      if (i===pagination.current) {
          el.className = 'on';
      } else {
          el.onclick = (function(i) {
              return function() {
                  pagination.gotoPage(i);
              }
          })(i);
      }

      fragment.appendChild(el);
  }
  paginationEl.appendChild(fragment);
}
  const getListItem = (index, places) => {
    var el = document.createElement('li'),
    itemStr = `
    <span class="markerbg marker_${index + 1}"></span>
    <div class="${styles.info}">
        <h5>${places.place_name}</h5>`;

    if (places.road_address_name) {
        itemStr += `    <span>` + places.road_address_name + `</span>` +
                    `/   <span className="jibun gray">` +  places.address_name  + `/</span>`;
    } else {
        itemStr += `    <span>` +  places.address_name  + `/</span>`; 
    }
    if (places.phone){             
      itemStr += `  <span className="tel">` + places.phone  + `/</span>` +
                `</div>`;           
    }

    el.innerHTML = itemStr;
    el.className = styles.searchli;
    el.onclick = () => {
      const setLocation = new window.kakao.maps.LatLng(
        places.y,
        places.x
      );
      if(kakaomap){
        if(searchMarker){
          searchMarker.setMap(null);
        }
        kakaomap.setCenter(setLocation)
        var marker = new window.kakao.maps.Marker({
          position: setLocation,
        });
        marker.setMap(kakaomap);
        setMarkers(marker)
        closeSModal()
      }
    }
    return el;
  }
  const displayPlaces = (places) => {
      console.log(window.kakao.maps)
      var listEl = document.getElementById('placesList'),
      metnuEl = document.getElementById('menu_wrap'),
      fragment = document.createDocumentFragment(),
      bounds = new window.kakao.maps.LatLngBounds()
      // 검색 결과 목록에 추가된 항목들을 제거합니다
      removeAllChildNods(listEl);
      console.log(bounds)
      var h3 = document.createElement('h3')
      h3.innerHTML = `${places.length}건의 검색 결과`;
      h3.className = `${styles.title}`;
      for ( var i=0; i<places.length; i++ ) {
        var placePosition = new window.kakao.maps.LatLng(places[i].y, places[i].x),
        itemEl = getListItem(i, places[i]);
        bounds.extend(placePosition)
        fragment.appendChild(itemEl);
      }
      var hr = document.createElement('hr')
      listEl.appendChild(h3)
      listEl.appendChild(hr)
      listEl.appendChild(fragment);
      metnuEl.scrollTop = 0;
      kakaomap.setBounds(bounds)
  }

  const placesSearchCB = (data, status, pagination) => {
    
    if(status === window.kakao.maps.services.Status.OK) {
        displayPlaces(data);

        displayPagination(pagination)
    }
    else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {

    alert('검색 결과가 존재하지 않습니다.');
    return;

    } else if (status === window.kakao.maps.services.Status.ERROR) {

    alert('검색 결과 중 오류가 발생했습니다.');
    return;

    }
  }
  const lat_long_Search = async (searchValue) => {
    if(window.kakaoScriptLoaded) 
    {
      new window.kakao.maps.services.Places().keywordSearch(searchValue, placesSearchCB)
    }
  }

  //검색 알고리즘
  const handleSearch = (event) => {
    const searchValue = document.getElementById("search_input").value

    if (!searchValue.replace(/^\s+|\s+$/g, '')) {
      alert('키워드를 입력해주세요!');
      return;
    }

    const matchedDevice = devices.find((device) => 
      device.device_num === searchValue)
    //디바이스 번호로 검색 
    if(matchedDevice){
        const moveLatLon = new window.kakao.maps.LatLng(
          matchedDevice.latitude,
          matchedDevice.longitude
        );
        kakaomap.setCenter(moveLatLon); // map 변수를 사용하여 지도 중심을 이동
    }
    //키워드로 검색 
    else {
        openSModal()
        lat_long_Search(searchValue)
    }
  }
  
  const db_power_change = async (device_num, thing , on_off)=> {
    try {
      const response = await fetch("/api/changePower", {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_num: device_num,
          thing : thing,
          on_off : on_off
        }),

      });
      if (response.ok) {
        console.log("db에 작동 결과를 저장했습니다.")
      } else {
        console.error('Network response was not ok:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    } 
  }
  //버튼 클릭 시 경우의 수
  const change_power =useCallback ( async (device_num, thing ,on_off) => {  
    //DB와 전역 변수의 데이터가 일치하는지 확인
    const checkingPower = async () => {
      try {
        const response = await fetch("/api/getPower", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_num: device_num,
          }),
  
        });
        if (response.ok) {
          const dataPower = await response.json();
          switch(thing) {
            case 'sunshade_power':
              if(dataPower.power[0].sunshade_power !== on_off){
                on_off ? dispatch(
                  deviceActions.off_sunshade_power({
                    device_num: device_num,
                  }))
                  :
                  dispatch(
                    deviceActions.on_sunshade_power({
                      device_num: device_num,
                    }))
                toast.error(device_num + "의 차양막은 이미 원하는 상태입니다");
                return false;
                }
                return true;
            case 'led_power':
              if(dataPower.power[0].led_power !== on_off){
                on_off ? dispatch(
                  deviceActions.off_led_power({
                    device_num: device_num,
                  }))
                  :
                  dispatch(
                    deviceActions.on_led_power({
                      device_num: device_num,
                    }))
                    toast.error(device_num + "의 LED는 이미 원하는 상태입니다.");
                return false;
              }
              return true;
              case 'led2_power':
                if(dataPower.power[0].led2_power !== on_off){
                  on_off ? dispatch(
                    deviceActions.off_led2_power({
                      device_num: device_num,
                    }))
                    :
                    dispatch(
                      deviceActions.on_led2_power({
                        device_num: device_num,
                      }))
                      toast.error(device_num + "의 LED2는 이미 원하는 상태입니다.");
                  return false;
                }
                return true;
              default:
                toast.error(device_num  + " 잘못된 절차입니다");
                return false;
          }

        } else {
          toast.error('Network response was not ok:', response.statusText);
          return false;
        }
      } catch (error) {
        toast.error('Error:', error);
        return false
      } 
    };
    var haveMatched = true;
    await checkingPower() ? haveMatched = true : haveMatched=false;

    if(!haveMatched){
      return;
    }
    if(on_off === 1){
      switch(thing){
        case 'sunshade_power' :
          dispatch(
            deviceActions.off_sunshade_power({
              device_num: device_num,
            })
          );
          toast.success(`${device_num} 차양막을 접습니다`)
          break;
        case 'led_power' :
          dispatch(
            deviceActions.off_led_power({
              device_num: device_num,
            })
          );
          toast.success(`${device_num} led 전원을 끕니다`)
          break;
          case 'led2_power' :
            dispatch(
              deviceActions.off_led2_power({
                device_num: device_num,
              })
            );
            toast.success(`${device_num} led2 전원을 끕니다`)
            break;
        default :
          haveMatched = false;  
          break;
      }
    }
    else if(on_off === 0){
      switch(thing){
        case 'sunshade_power' :
          dispatch(
            deviceActions.on_sunshade_power({
              device_num: device_num,
            })
          );
          toast.success(`${device_num} 차양막을 펼칩니다`)
          break;
        case 'led_power' :
          dispatch(
            deviceActions.on_led_power({
              device_num: device_num,
            })
          );
          toast.success(`${device_num} led 전원을 킵니다`)
          break;
        case 'led2_power' :
          dispatch(
            deviceActions.on_led2_power({
              device_num: device_num,
            })
          );
          toast.success(`${device_num} led2 전원을 킵니다`)
            break;
        default :
          haveMatched = false;
          break;
      } 
    }
    else{
      toast.error("잘못된 접근입니다.")
      haveMatched = false;
    }
    if(haveMatched){
      db_power_change(device_num, thing, on_off).then(
        (value) => controlFunction.controlDevice(devices.find((device) => device.device_num === device_num).ip_address,thing,on_off)
      )

    }
  },[devices, dispatch])
  
  // 사이드바 아이템 및 버튼 설정
  useEffect(() => {

    
    //#region 만약에 callBack 함수가 잘못되었을 시
    // const db_power_change = async (device_num, thing , on_off)=> {
    //   try {
    //     const response = await fetch("/api/changePower", {
    //       method: "Post",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         device_num: device_num,
    //         thing : thing,
    //         on_off : on_off
    //       }),
  
    //     });
    //     if (response.ok) {
    //       alert("db에 작동 결과를 저장했습니다.")
    //     } else {
    //       console.error('Network response was not ok:', response.statusText);
    //     }
    //   } catch (error) {
    //     console.error('Error:', error);
    //   } 
    // }
    // //버튼 클릭 시 경우의 수
    // const change_power = (device_num, thing ,on_off) => {
      
    //   //DB와 전역 변수의 데이터가 일치하는지 확인
    //   const checkingPower = async () => {
    //     try {
    //       const response = await fetch("/api/getPower", {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //           device_num: device_num,
    //         }),
    
    //       });
    //       if (response.ok) {
    //         const dataPower = await response.json();
    //         switch(thing) {
    //           case 'sunshade_power':
    //             if(dataPower.power[0].sunshade_power !== on_off){
    //               alert(device_num,"이미 진행된 절차입니다.")
    //               return;
    //               }
    //             break;
    //           case 'led_power':
    //             if(dataPower.power[0].led_power !== on_off){
    //               alert(device_num,"이미 진행된 절차입니다.")
    //               return;
    //             }
    //             break;
    //             case 'led2_power':
    //               if(dataPower.power[0].led2_power !== on_off){
    //                 alert(device_num,"이미 진행된 절차입니다.")
    //                 return;
    //               }
    //               break;
    //             default:
    //               alert(device_num ,"잘못된 절차입니다");
    //               break;
    //         }

    //       } else {
    //         console.error('Network response was not ok:', response.statusText);
    //       }
    //     } catch (error) {
    //       console.error('Error:', error);
    //     } 
    //   };
    //   checkingPower();

    //   var haveMatched = true;

    //   if(on_off === 1){
    //     switch(thing){
    //       case 'sunshade_power' :
    //         dispatch(
    //           deviceActions.off_sunshade_power({
    //             device_num: device_num,
    //           })
    //         );
    //         alert(`${device_num} 차양막을 접음`)
    //         break;
    //       case 'led_power' :
    //         dispatch(
    //           deviceActions.off_led_power({
    //             device_num: device_num,
    //           })
    //         );
    //         alert(`${device_num} led 꺼짐`)
    //         break;
    //         case 'led2_power' :
    //           dispatch(
    //             deviceActions.off_led2_power({
    //               device_num: device_num,
    //             })
    //           );
    //           alert(`${device_num} led2 꺼짐`)
    //           break;
    //       default :
    //         haveMatched = false;  
    //         break;
    //     }
    //   }
    //   else if(on_off === 0){
    //     switch(thing){
    //       case 'sunshade_power' :
    //         dispatch(
    //           deviceActions.on_sunshade_power({
    //             device_num: device_num,
    //           })
    //         );
    //         alert(`${device_num} 차양막 펼침`)
    //         break;
    //       case 'led_power' :
    //         dispatch(
    //           deviceActions.on_led_power({
    //             device_num: device_num,
    //           })
    //         );
    //         alert(`${device_num} led 킴`)
    //         break;
    //         case 'led2_power' :
    //           dispatch(
    //             deviceActions.on_led2_power({
    //               device_num: device_num,
    //             })
    //           );
    //           alert(`${device_num} led2 킴`)
    //           break;
    //       default :
    //         haveMatched = false;
    //         break;
    //     } 
    //   }
    //   else{
    //     alert("잘못된 접근입니다.")
    //     haveMatched = false;
    //   }
    //   if(haveMatched){
    //     db_power_change(device_num, thing, on_off)
    //   }
    // }
    //#endregion
   
    const getIconURL = (device) => {
      var arrayBuffer = null;
      if(owners.length!==0 && device && device.device_owner === '소프트상추'){
        arrayBuffer = new Uint8Array(owners.find((owner) => owner.device_owner === "소프트상추").owner_image.data).buffer;
      }
      else if (owners.length!==0 && device && device.device_owner === '해당 없음'){
        arrayBuffer = new Uint8Array(owners.find((owner) => owner.device_owner === "해당 없음").owner_image.data).buffer;              
      }
      else {
        return;
      }
      const blob = new Blob([arrayBuffer], { type: 'image/png' });
      var imageSrc = URL.createObjectURL(blob)
      return imageSrc  
      
    }
    
    const NavItems = devices.map((device) => ({
      icon: <img src={getIconURL(device)} alt={`Device ${device.device_num}`}  className ={`${styles.iconImage}`}/>, // 이미지로 아이콘 구성
      title: device.area,
      deviceName: `Device ${device.device_num}`,
      clickEvent : () => {
        console.log(device)
        kakaomap.setCenter(
          new window.kakao.maps.LatLng(
            device.latitude,
            device.longitude,
          )
        )
      },
      buttons: [
        { text: 'Sunshade_Power', onClick: (e) =>{
          change_power(device.device_num, 'sunshade_power',device.sunshade_power);
          e.stopPropagation(); // 버블링 막기 (sidebar item 전체를 클릭하는 이벤트 방지)
        } ,color : (device.sunshade_power ? '#535C63' : '#241F20') ,backgroundColor : (device.sunshade_power ? '#EECAD5' : '#D1E9F6') },
        { text: 'LED_Power', onClick: (e) => {
          change_power(device.device_num, 'led_power',device.led_power);
          e.stopPropagation(); // 버블링 막기 (sidebar item 전체를 클릭하는 이벤트 방지)
        },color : (device.sunshade_power ? '#535C63' : '#241F20') ,backgroundColor : (device.led_power ? '#EECAD5' : '#D1E9F6') },
        { text: 'LED2_Power', onClick: (e) => {
          change_power(device.device_num, 'led2_power',device.led2_power);
          e.stopPropagation(); // 버블링 막기 (sidebar item 전체를 클릭하는 이벤트 방지)
        } ,color : (device.sunshade_power ? '#535C63' : '#241F20') ,backgroundColor : (device.led2_power ? '#EECAD5' : '#D1E9F6') },
      ],
    }));

    setNavItems(NavItems);
  }, [devices, dispatch, owners, kakaomap, change_power]);

  const handleChange = (selectedOptions) => {
    const newSelectedIPs = selectedOptions.map(option => option.value);
    if (new Set(newSelectedIPs).size !== newSelectedIPs.length) {
      alert('이미 선택한 데이터입니다');
      return;
    }
    console.log(newSelectedIPs)
    setSelectedIPs(newSelectedIPs);
  };

  const handleButtonClick = (action) => {
    const mode = ['sunshade_power','led_power', 'led2_power' ];
    if (action === 'select on' || action === 'select off') {
      if(!selectedMode){
        alert("모드가 선택되지 않았습니다.")
      }
      else if(selectedIPs.length !== 0){
        for(let i =0 ; i<selectedIPs.length; i++){
          const device = devices.find((device) => device.ip_address === selectedIPs[i])
          if(action === 'select on' && device[mode[selectedMode-1]] === 0){
            change_power(device.device_num, mode[selectedMode-1], device[mode[selectedMode-1]])
            console.log(selectedIPs[i],devices.find((device) => device.ip_address === selectedIPs[i])[mode[selectedMode-1]] === 0)
          }
          else if(action === 'select off' && device[mode[selectedMode-1]] === 1){
            change_power(device.device_num, mode[selectedMode-1], device[mode[selectedMode-1]])
            console.log(selectedIPs[i],devices.find((device) => device.ip_address === selectedIPs[i])[mode[selectedMode-1]] === 1)
          }
          else if(action === 'select on' && device[mode[selectedMode-1]] === 1){
            toast.error(device.device_num + " Already On")
          }
          else if(action === 'select off' && device[mode[selectedMode-1]] === 0){
            toast.error(selectedIPs[i] + "Already Off")
          }
          else {
            toast.error("다중 선택 모드에서 잘못된 접근입니다1.")
          }
        }
        setSelectedIPs([]);
        closeMModal()
      } 
      else {
        alert("값을 입력해주세요");
      }
    } else if (action === 'all on' || action === 'all off') {
      const ip_address_all = devices.map(element => (
        element.ip_address
      ))
      if(!selectedMode){
        alert("모드가 선택되지 않았습니다.")
      }
      else if(ip_address_all.length !== 0){
        for(let i =0 ; i<ip_address_all.length; i++){
          const device = devices[i]
          console.log(action, device[mode[selectedMode-1]])
          if(action === 'all on' && device[mode[selectedMode-1]] === 0){
            change_power(device.device_num, mode[selectedMode-1], device[mode[selectedMode-1]])
            console.log(ip_address_all[i],devices.find((device) => device.ip_address === ip_address_all[i])[mode[selectedMode-1]] === 0)
          }
          else if(action === 'all off' && device[mode[selectedMode-1]] === 1){
            change_power(device.device_num, mode[selectedMode-1], device[mode[selectedMode-1]])
            console.log(ip_address_all[i],devices.find((device) => device.ip_address === ip_address_all[i])[mode[selectedMode-1]] === 1)
          }
          else if(action === 'all on' && device[mode[selectedMode-1]] === 1){
            toast.error(device.device_num + " Already On")
          }
          else if(action === 'all off' && device[mode[selectedMode-1]] === 0){
            toast.error(device.device_num + "Already Off")
          }
          else {
            alert("다중 선택 모드에서 잘못된 접근입니다1.")
          }
        }
        setSelectedIPs([]);
        closeMModal()
      }
      else{
        alert("device가 존재하지 않습니다")
        closeMModal()
      } 
    
    }
  };
  const customStyles = {
    overlay: {
      backgroundColor: " rgba(0, 0, 0, 0.4)",
      width: "100%",
      height: "100vh",
      zIndex: "10",
      position: "fixed",
      top: "0",
      left: "0",
    },
    content: {
      width: "500px",
      height: "500px",
      zIndex: "150",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      borderRadius: "10px",
      boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
      backgroundColor: "white",
      justifyContent: "center",
      overflow: "auto",
    },
  };

  return (
    
    <div className={styles.sidebarBorder}>

      <Modal
        ariaHideApp={false}
        isOpen={mModalIsOpen}
        onRequestClose={closeMModal}
        style={customStyles}
        contentLabel="Select Control Devices"
      >
        <h2>Select Control Devices</h2>
        <Select
          isMulti
          options={devices.map(element => ({
            value: element.ip_address,
            label: element.device_num,
          }))}
          onChange={handleChange}
        />
        <div className = {styles.deviceContainer}>
        {selectedIPs.map(ip => {
          const device = devices.find(element => element.ip_address === ip);
          const deviceSunShade = devices.find(element => element.device_num === device.device_num)?.sunshade_power;
          const deviceLedPower = devices.find(element => element.device_num === device.device_num)?.led_power;
          const deviceLed2Power = devices.find(element => element.device_num === device.device_num)?.led2_power;
          return (
            <div key={ip} className={styles.selectedDevice}>
              IP: {ip} <br/> 
              S_Status: {deviceSunShade} <br/> 
              L_Stauus: {deviceLedPower} <br/>
              2L: {deviceLed2Power} <br/>
            </div>
          );
        })}
        </div>
        <div className={styles.buttonContainer}>
            <ButtonGroup  className={styles.guideButtons}>
              <Button className = {styles.guideButton} onClick={() => setSelectedMode(1)} active={selectedMode === 1}>SunShade</Button>
              <Button className = {styles.guideButton} onClick={() => setSelectedMode(2)} active={selectedMode === 2}>LED1</Button>
              <Button className = {styles.guideButton} onClick={() => setSelectedMode(3)} active={selectedMode === 3}>LED2</Button>
            </ButtonGroup>
            <div className={styles.upperButtons}>
              <Button className = {styles.Btn1} onClick={() => handleButtonClick('select on')}>Select On</Button>
              <Button className = {styles.Btn2} onClick={() => handleButtonClick('select off')}>Select Off</Button>
            </div>
            <div className={styles.lowerButtons}>
              <Button className = {styles.Btn1} onClick={() => handleButtonClick('all on')}>All On</Button>
              <Button className = {styles.Btn2} onClick={() => handleButtonClick('all off')}>All Off</Button>
            </div>
        </div>
      </Modal>
      
      <Modal
        ariaHideApp={false}
        isOpen={sModalIsOpen}
        onRequestClose={closeSModal}
        style={customStyles}
        contentLabel="Select Control Devices"
      >
        <div id="menu_wrap" className={styles.menu_wrap}>
          <ul id="placesList"></ul>
          <hr></hr>
          <div id="pagination"></div>
        </div>
        <Button onClick={closeSModal}>닫기</Button>
      </Modal>

      <div className={styles.logo}>
        <Logo></Logo>
        <span>
          <Button 
            onClick={() => openMModal()}
            color="info"
            outline>
            Multi Control
          </Button>
        </span>
        {/* 화면 크기가 줄었을 시 나오는 버튼인데... 나중 활용 
        <span className={styles.btn}>
          <Button
            close
            size="sm"
            className={styles.btn}
            onClick={() => showMobilemenu()}
          ></Button>
        </span> */}
      </div>
      <InputGroup className="mb-3, mt-3">
            <Form.Control placeholder="Click to Search" id="search_input"/>
            <Button onClick={handleSearch}> <IoSearch /> </Button>
          </InputGroup>
      <div className={styles.navArea}>
      <div vertical={true.toString()} className={styles.sidebarNav}>
      {navItems.map((navi, index) => (
        <div key={index} className={styles.sidenavBg} onClick={navi.clickEvent}>
          <div className={styles.iconSection}>
            {navi.icon}
          </div>
          <div className={styles.deviceSection}>
            <div className={styles.title}>
              {navi.title} <br/>({navi.deviceName})
            </div>
          </div>
          {navi.buttons.map((button, btnIndex) => (
            <Button
              key={btnIndex}
              className={styles.deviceButton}
              onClick={button.onClick}
              style={{ background: `${button.backgroundColor}`, color: `${button.color}` , fontWeight: `${'bold'}`}}
            >
              {button.text}
            </Button>
          ))}
        </div>
    ))}
  </div>
      </div>
    </div>
  );
};

export default Sidebar;
