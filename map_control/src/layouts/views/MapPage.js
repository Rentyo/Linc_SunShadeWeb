import React, { useEffect, useState, useMemo } from "react";
import Spinner from "../../assets/loading.gif";
import {IoClose} from "react-icons/io5";
import styles from "./MapPage.module.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";
import { deviceActions } from "../../redux/deviceSlice";
import { ownerActions } from "../../redux/ownerSlice"
import { mapActions } from "../../redux/mapSlice"

import { useOutletContext } from 'react-router-dom';

const MapPage = () => {
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [map, setMap] =useState(null);
  const [loading, setLoading] = useState(true);


  const dispatch = useDispatch();
  const devices = useSelector(
    (state) => state.devices.devices
  )
  const owners = useSelector(
    (state) =>  state.owners.owners
  )
  const {clickIcon} = useOutletContext();

  const data = useMemo(() => [
    { loc: "서구", lat: 36.355602, long:127.384228 },
    { loc: "동구", lat: 36.311487, long:127.454951 },
    { loc: "유성구", lat: 36.362014, long:127.356462 },
    { loc: "대덕구", lat: 36.346893, long:127.415740 },
    { loc: "중구", lat: 36.325574, long:127.421561 },
  ], []); 

  useEffect(() => {
    console.log('Fetching data...'); 
    const getOwnerData = async () => {
      try {
        const response = await fetch("/api/getOwner", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const dataOwner = await response.json();
          for (let i = 0; i < dataOwner.owner.length; i++) {
            //전역 변수에 저장
            dispatch(ownerActions.insertOwner(dataOwner.owner[i]));
          }
        } else {
          console.error('Network response was not ok:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      } 
    };
    getOwnerData();
    const getDeviceData = async () => {
      try {        
        const response = await fetch("/api/getDevice", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const dataDevice = await response.json();

          for (let i = 0; i < dataDevice.deviceinfo.length; i++) {
            //전역 변수에 저장
            dispatch(deviceActions.insertDevice(dataDevice.deviceinfo[i]));
          }
        } else {
          console.error('Network response was not ok:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
        
      }
    };
    getDeviceData();
  }, [dispatch])

  useEffect(() => {
    console.log("맵 불러오기")
    let mapInstance;
    
    //카카오 맵 api 키 바꾸기
    const initMap = async () => {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=` + process.env.REACT_APP_KAKAO_JS_KEY +`&libraries=services&autoload=false`;
      document.head.appendChild(script);

      // 카카오맵 API 스크립트가 로드되면 실행될 함수
      script.onload = () => {
        //임시 위치 (서구)
        const location = data[0]
        // 카카오맵 초기화
        window.kakao.maps.load(() => {
          const container = document.getElementById("map");
          if (!container) {
            setTimeout(initMap, 100); // 새로 고침을 연타할 때 DOM 객체가 불러오지 않는 경우를 대비
            return;
          }
          const options = {
            center: new window.kakao.maps.LatLng(location.lat, location.long), //첫 지도 화면 위치
            level: 2, // 확대 수준
          };
          mapInstance = new window.kakao.maps.Map(container, options);
          
          //마우스 휠 확대 축소 막기
          mapInstance.setZoomable(false);  
          
          
          setMap(mapInstance);  //map 변수를 상태로 업데이트
          dispatch(mapActions.MapValue(mapInstance))
          window.kakaoScriptLoaded = true;
        });
      };
    };
    // 카카오맵 API를 비동기적으로 불러옵니다.
    initMap();
    return () => {
      // 컴포넌트가 언마운트될 때 스크립트를 제거합니다.
      const script = document.querySelector(
        'script[src^="https://dapi.kakao.com"]'
      );
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, [navigate, data,dispatch]);

  
  useEffect(() => {
       //개체마다 마커 설정
       if(devices && map){
        devices.forEach((device) => {
          window.kakao.maps.load(() => {
            const position = new window.kakao.maps.LatLng(
              parseFloat(device.latitude),
              parseFloat(device.longitude)
            ); 
            var arrayBuffer = null;
            // 소프트 상추 이미지 마크 생성
            if(device.device_owner === '소프트상추'){
              arrayBuffer = new Uint8Array(owners.find((owner) => owner.device_owner === "소프트상추").owner_image.data).buffer;
            }
            else{
              arrayBuffer = new Uint8Array(owners.find((owner) => owner.device_owner === "해당 없음").owner_image.data).buffer;              
            }
            const blob = new Blob([arrayBuffer], { type: 'image/png' });
              var imageSrc = URL.createObjectURL(blob), // 마커이미지의 주소입니다    
              imageSize = new window.kakao.maps.Size(50, 50), // 마커이미지의 크기입니다
              imageOption = {offset: new window.kakao.maps.Point(25, 25)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
              var markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption)
              var marker = new window.kakao.maps.Marker({
                position: position,
                image: markerImage, // 마커이미지 설정
              });
            window.kakao.maps.event.addListener(marker, "click", function () {
              // setSelectedDevice(device);
              clickIcon(device);
            });
            marker.id=device.device_num
            marker.setMap(map); 
          
          });
        });
      }
  }, [clickIcon, devices, dispatch, map, owners])

  const handleCloseInfo = () => {
    setSelectedDevice(null);
  };
  const zoomIn = () => {
    map.setLevel(map.getLevel() - 1);
  }
  const zoomOut = () => {
    map.setLevel(map.getLevel() + 1);
  }

  return (
    <>
    { loading ? 
    <div className={styles.loading}>
      <h3>데이터를 로딩하고 있습니다. 
          잠시만 기다려주세요.
      </h3>
      <img src={Spinner} alt="로딩" width="10%" />
    </div> 
    
    :
    
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        {selectedDevice ? (
          <>
            <div className={styles.infoHeader}>
              <IoClose className={styles.closeIcon} onClick={handleCloseInfo} />
            </div>

            <table className={styles.infoTable}>
            <tbody>
              <tr>
                <th>Device Number</th>
                <td>{selectedDevice.device_num}</td>
              </tr>
              <tr>
                <th>IP Address</th>
                <td>{selectedDevice.device_ip_address}</td>
              </tr>
              <tr>
                <th>Location</th>
                <td>{selectedDevice.location}</td>
              </tr>
              <tr>
                <th>(Lati, Long)</th>
                <td>{`(${selectedDevice.latitude}, ${selectedDevice.longitude})`}</td>
              </tr>
              <tr>
                {/* <td className={styles.lastcell} colSpan="2">{dept === selectedDevice.location && (
              <div className = {styles.btnContainer}>
                <Button className={styles.btn} onClick={handleGoToEntityPage}>Go Entity Page</Button>
              </div>
            )}</td> */}
              </tr>

            </tbody>
            </table>
            
          </>
        ) : (
          <></>
        )}
      </div>
      <div className={styles.map_wrap}>
        <div id="map" className={styles.mapContainer}></div>
        <div className={styles.custom_zoomcontrol} > 
          <span className={styles.custom_zoomcontrol_span} onClick={zoomIn}><img className={styles.custom_zoomcontrol_img} src = {process.env.REACT_APP_KAKAO_PLUS_IMG} alt="확대" /></span>  
          <span className={styles.custom_zoomcontrol_span} onClick={zoomOut}><img className={styles.custom_zoomcontrol_img} src= {process.env.REACT_APP_KAKAO_MINUS_IMG} alt="축소" /></span>
        </div>
      </div>
    </div>
      }
      </>
  );
};

export default MapPage;
