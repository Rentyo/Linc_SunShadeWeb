const express = require("express");
const router = express.Router();
const userController = require("./userDBControl");

//Map 페이지에서 필요한 데이터를 가져 옴
router.get("/getDevice", userController.getDevice);
router.get("/getOwner", userController.getOwner);

//SideBar 컴포넌트에서 버튼 작동을 위해 사전에 확인 작업
router.post("/getPower", userController.getPower);
//SideBar 컴포넌트에서 버튼 작동에 대한 결과를 db에 저장
router.post("/changePower", userController.changePower)


module.exports = router;
