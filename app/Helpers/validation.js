'use strict'

const Antl = use('Antl')
const { ucFirst, getSubstring } = use('App/Helpers/string')

function generateMessage (field, rule) {
  let message = {}
  message.field = field
  message.validation = getSubstring(rule, null, ':')
  if (rule.indexOf(':') !== -1) {
    message.message = Antl.formatMessage(`validation.${getSubstring(rule, null, ':')}`, {
      field: ucFirst(field),
      value: getSubstring(rule, ':', ',')
    })
  } else {
    message.message = Antl.formatMessage(`validation.${rule}`, { field: ucFirst(field) })
  }
  return message
}

function createMessagesObj (rules) {
  const messagesObj = {}

  for (let key in rules) {
    const fieldRules = rules[key].split('|')
    for (let rule of fieldRules) {
      const { field, message, validation } = generateMessage(key, rule)
      messagesObj[`${field}.${validation}`] = message
    }
  }

  return messagesObj
}

function generateErrors (failRules) {
  const errors = []
  failRules.forEach(rule => {
    const fieldRule = rule.split('.')
    errors.push(generateMessage(fieldRule[0], fieldRule[1]))
  })

  return errors
}

module.exports = { createMessagesObj, generateMessage, generateErrors }
