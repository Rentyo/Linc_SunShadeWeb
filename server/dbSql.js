const db = require("./db");

// 디바이스 번호, IP 주소, 위도/경도, 디바이스 소유사, 전원 얻기
exports.getDevice = () => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT t1.device_num, t1.area, t1.ip_address, t1.latitude, t1.longitude, t1.sunshade_power, t1.led_power, t1.led2_power , t2.device_owner
      FROM device_info t1, device_owner t2
      WHERE t1.device_num = t2.device_num`, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};
// 회사 정보 가져오기
exports.getOwner = () => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT device_owner , owner_image , phone_num
      FROM owner`, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}
//device의 power 정보 불러오기
exports.getPower = (device_num) => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT sunshade_power, led_power, led2_power 
      FROM device_info 
      WHERE device_num = ${device_num};`
      , (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}
//device의 power 정보 수정
exports.changePower = (device_num, thing , on_off) => {
  return new Promise((resolve, reject) => {
    db.query(`UPDATE device_info SET ${thing}=${on_off}  
      WHERE device_num = ${device_num};`
      , (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}
