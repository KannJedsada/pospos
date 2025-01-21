const path = require("path");

module.exports = function override(config, env) {
  // เปลี่ยน path ไปที่ build
  config.output.publicPath = "/build/";
  return config;
};
