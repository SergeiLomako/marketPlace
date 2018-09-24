'use strict'
const moment = require('moment');

module.exports = function addDaysToDate (date, daysCount) {
  const newDate = new Date(date.setDate(date.getDate() + daysCount))
  const year = newDate.getFullYear()
  const month = newDate.getMonth() + 1 < 10 ? `0${newDate.getMonth() + 1}` : newDate.getMonth() + 1
  const days = newDate.getDate() < 10 ? `0${newDate.getDate()}` : newDate.getDate()
  const hours = newDate.getHours() < 10 ? `0${newDate.getHours()}` : newDate.getHours()
  const minutes = newDate.getMinutes() < 10 ? `0${newDate.getMinutes()}` : newDate.getMinutes()
  const seconds = newDate.getSeconds() < 10 ? `0${newDate.getSeconds()}` : newDate.getSeconds()
  console.log(`${year}-${month}-${days} ${hours}:${minutes}:${seconds}`)
  return '2018-09-24 10:16:36'//`${year}-${month}-${days} ${hours}:${minutes}:${seconds}`
}
