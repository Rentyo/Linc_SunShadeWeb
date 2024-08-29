import { useState, useEffect, useCallback, useRef } from "react";
import { Button,Table,Pagination, PaginationItem, PaginationLink } from "reactstrap";
import Logo from "./Logo";
import styles from "./Sidebar.module.css";
import styles_Full from "./FullLayout.module.css";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import {IoSearch} from "react-icons/io5";
import { ImMap } from "react-icons/im";
import { FaUmbrellaBeach } from "react-icons/fa6";
import { useSelector, useDispatch } from "react-redux";
import { deviceActions } from "../redux/deviceSlice";
import Modal from 'react-modal';
import Select from "react-select";
import * as controlFunction from "../Function/Control";
import { toast } from 'react-toastify';    


const Sidebar = (props) => {
  
  const devices = useSelector(
    (state) => state.devices.devices
  )
  const kakaomap = useSelector(
    (state) => state.map.map
  )
  const owners = useSelector(
    (state) =>  state.owners.owners
  )


  const [isMultiControl, setIsMultiControl] = useState(false);
  
  const [selectedIPs,setSelectedIPs] = useState([]);
  
  const handleMultiControlToggle = () => {
    if (isMultiControl) {
      setSelectedIPs([]);
    }
    setIsMultiControl(!isMultiControl);
  };
  const handleDeviceSelect = (deviceIP) => {
    setSelectedIPs((prevSelected) =>
      prevSelected.includes(deviceIP)
        ? prevSelected.filter((IP) => IP !== deviceIP)
        : [...prevSelected, deviceIP]
    );
  };
  
  const dispatch = useDispatch();

  //숨긴 마커
  const [hideMarker , setHideMarker] = useState([]);

  //사이드 바 아이템 
  const [navItems, setNavItems] = useState([]);


  //검색 모드 
  const [searchMode, setSearchMode] = useState(false);

  //정렬 모드
  const [sortMode, ] = useState(
    [
      { value : 'default' , label  : "..."},
      { value : 'area', label : "장소"},
      { value : 'sido_nm', label : "시도명"},
      { value : 'sigungu_nm', label: "시군구명"},
      { value : 'dong_nm' , label: "읍면동명"},
      { value : 'device_owner', label : "관리자"},
      { value : 'device_num' , label : "디바이스 번호"}
    ]
  );
  const [selectedSortMode, setSelectedSortMode] = useState(null)

  //검색 모달
  const [sModalIsOpen, setSModalIsOpen] = useState(false);
  const openSModal = () => setSModalIsOpen(true);
  const closeSModal = () => setSModalIsOpen(false);

  //검색 Pagination
  const [sPagination, setSPagination] = useState([]);



  const [searchMarker , setMarkers] = useState(null);

 
  const [selectedMode, setSelectedMode] = useState(null);
  
  const itemRefs = useRef([]);


  const showMobilemenu = () => {
    document
      .getElementById("sidebarArea")
      .classList.toggle(styles_Full.showSidebar);
  };


  const removeAllChildNodes = (parent) => {
    while(parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  const displayPagination = (pagination) => {

    const pages = [];
        pages.push(
          <PaginationItem key='first'>
            <PaginationLink
              first
              href="#"
              onClick={() => {pagination.gotoPage(1);
                var modal = document.getElementById("searchModal");
                modal.scrollTop =0;
              }}
            />
          </PaginationItem>
        )
        pages.push(
          <PaginationItem key='back'>
            <PaginationLink
              href="#"
              previous
              onClick={() => {
                pagination.gotoPage(pagination.current-1);
                var modal = document.getElementById("searchModal");
                modal.scrollTop =0;
              }}
            />
          </PaginationItem>
        )
    for (let i=1; i<=pagination.last; i++) {
        pages.push(
          <PaginationItem key={i} active={i === pagination.current}>
            <PaginationLink href="#" onClick={() => {pagination.gotoPage(i);
              var modal = document.getElementById("searchModal");
              modal.scrollTop =0;
            }}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      pages.push(
        <PaginationItem key='next'>
          <PaginationLink
            href="#"
            next
            onClick={() => {pagination.gotoPage(pagination.current +1);
              var modal = document.getElementById("searchModal");
              modal.scrollTop =0;
            }}
          />
        </PaginationItem>
      )
      pages.push(
        <PaginationItem key='last'>
          <PaginationLink
            href="#"
            last
            onClick={() => {pagination.gotoPage(pagination.last);
              var modal = document.getElementById("searchModal");
              modal.scrollTop =0;
            }}
          />
        </PaginationItem>
      )
    setSPagination(pages)
}
  const getListItem = (index, places) => {
    var el = document.createElement('tr'),
    itemStr = `
    <th>${index+1}</th>
    <th>${places.place_name}</th>`;
    itemStr += `<th>`
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
    itemStr += `</th>`

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
      var bounds = new window.kakao.maps.LatLngBounds(),
      table = document.getElementById('placeTable')
      if (table) {
          removeAllChildNodes(table)
      }
      for ( var i=0; i<places.length; i++ ) {
        var placePosition = new window.kakao.maps.LatLng(places[i].y, places[i].x),
        itemEl = getListItem(i, places[i]);
        bounds.extend(placePosition)
        table.appendChild(itemEl);
      }
      kakaomap.setBounds(bounds)
  }

  const placesSearchCB = (data, status, pagination) => {
    
    if(status === window.kakao.maps.services.Status.OK) {
        //검색 결과
        displayPlaces(data);
        //Pagination
        displayPagination(pagination)
    }
    else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {

    toast.error('검색 결과가 존재하지 않습니다.');
    return;

    } else if (status === window.kakao.maps.services.Status.ERROR) {

    toast.error('검색 결과 중 오류가 발생했습니다.');
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
    const searchValue = document.getElementById("search_input").value.split(' ').join('')

    const markerReset = () => {if(hideMarker.length !== 0){
      hideMarker.forEach((icon) => icon.setMap(kakaomap))
    }
    }

    if (!searchValue.replace(/^\s+|\s+$/g, '')) {
      markerReset()
      toast.error('키워드를 입력해주세요!');
      setHideMarker([])
      setNavItems(NavItems(devices))
      return;
    }
    //디바이스 번호로 검색
    if(searchValue.toLowerCase() === 'all'){
      markerReset()
      setHideMarker([])
      setNavItems(NavItems(devices));
      
    } 
    else if(!isNaN(searchValue) && searchMode === false){
      markerReset()
      const matchedDevice = devices.filter((device) => 
        device.device_num === searchValue)
      if(matchedDevice.length !== 0 ){
        const hideIcon = kakaomap.sa.filter((icon) => icon.id !== searchValue)
        hideIcon.forEach((icon) => icon.setMap(null))
        setHideMarker(hideIcon)
        setNavItems(NavItems(matchedDevice))
        const moveLatLon = new window.kakao.maps.LatLng(
          matchedDevice[0].latitude,
          matchedDevice[0].longitude
        );
        kakaomap.setCenter(moveLatLon); // map 변수를 사용하여 지도 중심을 이동
      }
      else
      {
        toast.error("검색한 번호에 해당하는 디바이스가 존재하지 않습니다");
      }
    }
    else if(isNaN(searchValue) && searchMode === false){
      markerReset()
      const filterData =
      devices.filter((device) => 
        (device.device_owner.split(' ').join('') 
        + device.area.split(' ').join('') 
        + device.sido_nm.split(' ').join('') 
        + device.sigungu_nm.split(' ').join('') 
        + device.dong_nm.split(' ').join(''))
        .indexOf(searchValue) !== -1)
      if(filterData.length !== 0){
        const hideIcon = kakaomap.sa.filter((icon) => !filterData.map((data) => data.device_num).includes(icon.id))
        hideIcon.forEach((icon) => icon.setMap(null))
        setHideMarker(hideIcon)
        setNavItems(NavItems(filterData))
        var bounds = new window.kakao.maps.LatLngBounds()
        for(var i = 0 ; i< filterData.length; i++) {
          const moveLatLon = new window.kakao.maps.LatLng(
            filterData[i].latitude,
            filterData[i].longitude
          );
          bounds.extend(moveLatLon)
        }
        kakaomap.setBounds(bounds)
      }
      else
      {
        toast.error("검색 결과에 해당되는 디바이스가 존재하지 않습니다.")
      }
      setSelectedSortMode(sortMode[0])
    }
    //키워드로 검색 
    else {
        openSModal()
        lat_long_Search(searchValue)
    }
    document.getElementById("search_input").value = '';
    
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
        toast.success("db에 작동 결과를 저장했습니다.")
      } else {
        toast.error('Network response was not ok:', response.statusText);
      }
    } catch (error) {
      toast.error('Error:', error);
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
  
  const getIconURL =useCallback( (device) => {
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
  }, [owners]);

  const NavItems = useCallback((devices, sort = 'area') => {
    return devices.map((device) => ({
    icon: <img src={getIconURL(device)} alt={`Device ${device.device_num}`}  className ={`${styles.iconImage}`}/>, // 이미지로 아이콘 구성
    area: device.area,
    sido_nm : device.sido_nm,
    sigungu_nm : device.sigungu_nm,
    dong_nm : device.dong_nm,
    device_owner : device.device_owner,
    device_num : device.device_num,
    ip_address : device.ip_address,
    upStr : device[sort],
    downStr : `Device ${device.device_num}`,
    clickEvent : () => {
      if(isMultiControl){
        handleDeviceSelect(device.ip_address)
      }
      else{
        kakaomap.setCenter(
          new window.kakao.maps.LatLng(
            device.latitude,
            device.longitude,
          )
        )
      }
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
  }))}, [change_power, getIconURL, isMultiControl, kakaomap]);

  // 사이드바 아이템 및 버튼 설정
  useEffect(() => {
    setNavItems(NavItems(devices));
  }, [devices, dispatch, owners, kakaomap, change_power, getIconURL, NavItems, setNavItems]);
  useEffect(() => {
    if (props.clickedMapIcon) {
      const clickedRef =itemRefs.current.find(element => 
        props.clickedMapIcon.device_num === element.id
      )
      
      clickedRef.scrollIntoView({
        behavior: 'smooth', // 부드러운 스크롤
        block: 'center' // 가까운 위치로 스크롤
      })
      clickedRef.style.setProperty('background-color', '#D4BDAC');
      clickedRef.style.setProperty('border-radius', '0.3rem');
      
      setTimeout(function(){
        clickedRef.style.setProperty('background-color', '#F6EACB');
        clickedRef.style.setProperty('border-radius', '0rem');
       }, 2000);
    
      props.nullIcon();
      return
    }
  }, [props.clickedMapIcon, props])
  const sortingItem = (selectedOption) => {
    setSelectedSortMode({ label: selectedOption.label, value: selectedOption.value })
    if(selectedOption.value === 'default'){
      setNavItems(NavItems(devices))
    }
    else{
      const temp_devices = new Array(Object.assign([], devices));
      const mappingData = navItems.map((element) =>
        element.device_num );
      
      const a = new Array([...temp_devices[0].filter((device) => mappingData.includes(device.device_num) ).sort(function compare(a, b) {
        if (a[selectedOption.value] < b[selectedOption.value]) return -1;
        if (a[selectedOption.value] > b[selectedOption.value]) return 1;
        return 0;
      })])
      setNavItems(NavItems(a[0], selectedOption.value))
      
    }
  } 
  /* 예전 다수 선택 모달 창에서 사용하던 메서드 */
  // const handleChange = (selectedOptions) => {
  //   const newSelectedIPs = selectedOptions.map(option => option.value);
  //   if (new Set(newSelectedIPs).size !== newSelectedIPs.length) {
  //     alert('이미 선택한 데이터입니다');
  //     return;
  //   }
  //   setSelectedIPs(newSelectedIPs);
  // };

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
          }
          else if(action === 'select off' && device[mode[selectedMode-1]] === 1){
            change_power(device.device_num, mode[selectedMode-1], device[mode[selectedMode-1]])
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
          if(action === 'all on' && device[mode[selectedMode-1]] === 0){
            change_power(device.device_num, mode[selectedMode-1], device[mode[selectedMode-1]])
          }
          else if(action === 'all off' && device[mode[selectedMode-1]] === 1){
            change_power(device.device_num, mode[selectedMode-1], device[mode[selectedMode-1]])
          }
          else if(action === 'all on' && device[mode[selectedMode-1]] === 1){
            toast.error(device.device_num + " Already On")
          }
          else if(action === 'all off' && device[mode[selectedMode-1]] === 0){
            toast.error(device.device_num + "Already Off")
          }
          else {
            toast.error("다중 선택 모드에서 잘못된 접근입니다1.")
          }
        }
        setSelectedIPs([]);
      }
      else{
        toast.error("device가 존재하지 않습니다")
      } 
    
    }
  };
  const customStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      width: "100%",
      height: "100vh",
      zIndex: "10",
      position: "fixed",
      top: "0",
      left: "0",
    },
    content: {
      width: "60%",
      height: "500px",
      zIndex: "150",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      borderRadius: "10px",
      boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
      backgroundColor: "#FEF3E2",
      justifyContent: "center",
      overflow: "auto",
    },
  };

  return (
    
    <div className={styles.sidebarBorder}>

      {/*예전 다중 컨트롤러*/}
      {/* <Modal
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
              <Button style = {{background: '#D0B8A8', color : 'black', fontWeight : 'bold'}} className = {styles.guideButton} onClick={() => setSelectedMode(1)} active={selectedMode === 1}>SunShade</Button>
              <Button style = {{background: '#D0B8A8', color : 'black', fontWeight : 'bold'}} className = {styles.guideButton} onClick={() => setSelectedMode(2)} active={selectedMode === 2}>LED1</Button>
              <Button style = {{background: '#D0B8A8', color : 'black', fontWeight : 'bold'}} className = {styles.guideButton} onClick={() => setSelectedMode(3)} active={selectedMode === 3}>LED2</Button>
            </ButtonGroup>
            <div className={styles.upperButtons}>
              <Button style= {{background: '#C5705D', color : 'white', fontWeight : 'bold'}} className = {styles.Btn1} onClick={() => handleButtonClick('select on')}>Select On</Button>
              <Button style= {{background: '#C5705D', color : 'white', fontWeight : 'bold'}} className = {styles.Btn2} onClick={() => handleButtonClick('select off')}>Select Off</Button>
            </div>
            <div className={styles.lowerButtons}>
              <Button style= {{background: '#C5705D', color : 'white', fontWeight : 'bold'}} className = {styles.Btn1} onClick={() => handleButtonClick('all on')}>All On</Button>
              <Button style= {{background: '#C5705D', color : 'white', fontWeight : 'bold'}} className = {styles.Btn2} onClick={() => handleButtonClick('all off')}>All Off</Button>
            </div>
        </div>
      </Modal> */}
      

      {/* 장소명 검색 결과 모달 */}
      <Modal
        ariaHideApp={false}
        isOpen={sModalIsOpen}
        onRequestClose={closeSModal}
        style={customStyles}
        contentLabel="Select Control Devices"
        id="searchModal"
      >
        <Table
          bordered
          hover
          responsive>
        <thead>
          <tr>
            <th style={{background: '#DFD3C3'}}>
              #
            </th>
            <th style={{background: '#DFD3C3'}}>
              Spot
            </th>
            <th style={{background: '#DFD3C3'}}>
              Location
            </th>
          </tr>
        </thead>
        <tbody id="placeTable">
        </tbody>
        </Table>
        <hr></hr>
        <Pagination aria-label="Page navigation example"
        size="sm"
        id = "tablePagination">
          {sPagination.length !==0  ? sPagination :
          <></>}
        </Pagination>
        <Button style = {{background: '#D0B8A8', color : 'black', fontWeight : 'bold'}} onClick={closeSModal}>닫기</Button>
      </Modal>

      <div className={styles.logo}>
        <Logo></Logo>
        <span>
          {/* 예전 멀티 컨트롤 버튼 */}
          {/* <Button 
            onClick={() => openMModal()}
            color="info"
            outline>
            Multi Control
          </Button> */}
          <Button
            onClick={handleMultiControlToggle}
            color="info"
            outline>
            {isMultiControl ? 'Done' : 'Multi Control'}
          </Button>
        </span>
        {/* 화면 크기가 줄었을 시 나오는 버튼인데... 나중 활용  */}
        <span className={styles.btn}>
          <Button
            close
            size="sm"
            className={styles.btn}
            onClick={() => showMobilemenu()}
          ></Button>
        </span>
      </div>
      <InputGroup className="mb-3, mt-3">
        <Form.Control placeholder="Click to Search" id="search_input"/>
        <Button onClick={handleSearch}> <IoSearch /> </Button>
        <Button color={searchMode ? "success": "light"} onClick={() =>setSearchMode(state => !state)}> 
          {searchMode ? <ImMap /> : <FaUmbrellaBeach/>}
        </Button>
      </InputGroup>
      <Select
          value={selectedSortMode}
          className = "mb-3, mt-3"
          isSearchable={false}
          options={sortMode.map(element => ({
            label: element.label,
            value : element.value,
          }))}
          onChange={sortingItem}
        />

      {/* 멀티 컨트롤 */}
      {isMultiControl && (
        <div className={styles.multiControlBtn}>
          <div className={styles.container}>
            <div className={styles.tabs}>
              <input
                type="radio"
                id="radio-1"
                name="tabs"
                checked={selectedMode === 1}
                onChange={() => setSelectedMode(1)}
              />
              <label className={styles.tab} htmlFor="radio-1">
                SunShade
              </label>

              <input
                type="radio"
                id="radio-2"
                name="tabs"
                checked={selectedMode === 2}
                onChange={() => setSelectedMode(2)}
              />
              <label className={styles.tab} htmlFor="radio-2">LED1</label>

              <input
                type="radio"
                id="radio-3"
                name="tabs"
                checked={selectedMode === 3}
                onChange={() => setSelectedMode(3)}
              />
              <label className={styles.tab} htmlFor="radio-3">LED2</label>

              <span className={styles.glider}></span>
            </div>
          </div>


          <div className={styles.upperButtons}>
            <Button className={styles.Btn1} onClick={() => handleButtonClick('select on')}>Select On</Button>
            <Button className={styles.Btn2} onClick={() => handleButtonClick('select off')}>Select Off</Button>
          </div>
          <div className={styles.lowerButtons}>
            <Button className={styles.Btn1} onClick={() => handleButtonClick('all on')}>All On</Button>
            <Button className={styles.Btn2} onClick={() => handleButtonClick('all off')}>All Off</Button>
          </div>
        </div>
      )}


      <div className={styles.navArea}>
      <div vertical={true.toString()} className={`${styles.sidebarNav} ${isMultiControl ? styles.multiControlActive : ''}`}>
      {navItems.map((navi, index) => (
        <div id = {navi.device_num} ref={(el) => {itemRefs.current[index] = el }} key={index} className={`${styles.sidenavBg} ${isMultiControl ? styles.multiControl : ''}`} onClick={navi.clickEvent}>
          <div className={styles.iconSection}>
            {navi.icon}
          </div>
          <div className={styles.deviceSection}>
            <div className={styles.area}>
              {navi.upStr} <br/>({navi.downStr})
            </div>
          </div>
          {isMultiControl && (
                <>
                  {navi.buttons.map((button, btnIndex) => (
                    <Button
                      key={btnIndex}
                      className={styles.deviceButton}
                      style={{ background: `${button.backgroundColor}`, color: `${button.color}`, fontWeight: `${'bold'}` }}
                      disabled={true}
                    >
                      {button.text}
                    </Button>
                  ))}

                  <input
                    type="checkbox"
                    checked={selectedIPs.includes(navi.ip_address)}
                    onChange={() => handleDeviceSelect(navi.ip_address)}
                    onClick={(event) => event.stopPropagation()} // 버블링 방지
                    className={styles.deviceCheckbox}
                  />
                </>
              )}
            {!isMultiControl &&navi.buttons.map((button, btnIndex) => (
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
