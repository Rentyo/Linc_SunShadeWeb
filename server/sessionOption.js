var options = {
  host: "localhost", //사용할 DB가 설치된 호스트의 IP
  user: "root",
  password: "1234",
  database: "softlettuce",
  port: 3306,

  clearExpired: true, // 만료된 세션 자동 확인 및 지우기 여부
  checkExpirationInterval: 10000, //만료된 세션이 지워지는 빈도(milliseconds)
  expiration: 1000 * 60 * 60 * 2, // 유효한 세션의 초대 기간 2시간으로 설정(milliseconds)
};

module.exports = options;
