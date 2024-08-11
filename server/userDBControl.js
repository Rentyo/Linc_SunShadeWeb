const bcrypt = require("bcrypt");
const userDB = require("./dbSql");

//기기 데이터 불러오기
exports.getDevice = async (req, res) => {
  try {
    const getdevice = await userDB.getDevice();
    if (!getdevice.length) {
      return res
        .status(401)
        .json({ success: false, message: "Device_Info 데이터가 비어있습니다." });
    }

    res
      .status(200)
      .json({ success: true, message: "Device_Info 데이터를 불러옵니다.", deviceinfo: getdevice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};
exports.getOwner = async (req, res) => {
  try {
    const getowner = await userDB.getOwner();
    if (!getowner.length) {
      return res
        .status(401)
        .json({ success: false, message: "Owner 데이터가 비어있습니다." });
    }

    res
      .status(200)
      .json({ success: true, message: "Owner 데이터를 불러옵니다.", owner: getowner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
}
//버튼 클릭 전 사전 확인 작업
exports.getPower = async (req, res) => {
  const {
    device_num
  } = req.body;
  try {
    const getpower = await userDB.getPower(device_num);
    if (!getpower.length) {
      return res
        .status(401)
        .json({ success: false, message: "기기가 존재하지 않습니다" });
    }
    res
      .status(200)
      .json({ success: true, message: `${device_num}의 powerData를 불러옵니다`, power: getpower });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
}
exports.changePower = async (req, res) => {
  const {
    device_num,
    thing,
    on_off
  } = req.body;
  const change_on_off = on_off ? 0 : 1
  try {
    const changepower = await userDB.changePower(device_num, thing , change_on_off);
    if (!changepower.affectedRows) {
      return res
        .status(401)
        .json({ success: false, message: "기기가 존재하지 않습니다" });
    }
    res
      .status(200)
      .json({ success: true, message: `${device_num}의 powerData를 변경하였습니다`, power: changepower });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
}


