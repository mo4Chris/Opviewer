const { check } = require("express-validator");

const checkForecastRead = check().custom((_, {req}) => {
  const token = req['token'];
  return token?.permission?.forecast?.read;
})


module.exports = {
  checkForecastRead
}
