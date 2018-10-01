'use strict'

const Antl = use('Antl')
const { ucFirst, getSubstring } = use('App/Helpers/string')

function generateMessage (field, rule) {
  return {
    field,
    validation: getSubstring(rule, null, ':'),
    message: Antl.formatMessage(`validation.${getSubstring(rule, null, ':')}`, {
      field: ucFirst(field),
      value: getSubstring(rule, ':', ',')
    })
  }
}

function createMessagesObj (rules) {
  const messagesObj = {}
  for (let key in rules) {
    rules[key].split('|').map(rule => {
      const { field, message, validation } = generateMessage(key, rule)
      messagesObj[`${field}.${validation}`] = message
    })
  }

  return messagesObj
}

const generateErrors = failRules => failRules.map(rule => {
  const fieldRule = rule.split('.')
  return (generateMessage(fieldRule[0], fieldRule[1]))
})

module.exports = { createMessagesObj, generateMessage, generateErrors }
