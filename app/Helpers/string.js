'use strict'

function ucFirst (str) {
  return str[0].toUpperCase() + str.substring(1)
}

function getSubstring (str, start, end) {
  let substring = str
  const substr = str.split(start || end)
  if (substr.length > 1) {
    substring = start ? substr[1].split(end)[0] : substr[0]
  }

  return substring
}

module.exports = { ucFirst, getSubstring }
