'use strict'

const Antl = use('Antl')

function ucFirst (str) {
  return str[0].toUpperCase() + str.substring(1)
}

function generateMessage (field, rule) {
  let message = {}
  const attributes = rule.split(':')
  if (attributes.length > 1) {
    message.key = `${field}.${attributes[0]}`
    if (attributes[0] === 'in') {
      message.title = Antl.formatMessage(`validation.${attributes[0]}`, {
        field: ucFirst(field),
        value: attributes[1]
      })
    } else {
      message.title = Antl.formatMessage(`validation.${attributes[0]}`, {
        field: ucFirst(field),
        value: attributes[1].split(',')[0]
      })
    }
  } else {
    message.key = `${field}.${rule}`
    message.title = Antl.formatMessage(`validation.${rule}`, { field: ucFirst(field) })
  }
  return message
}

const createMessagesObj = function (rules) {
  const messagesObj = {}

  for (let field in rules) {
    const fieldRules = rules[field].split('|')
    for (let rule of fieldRules) {
      const { key, title } = generateMessage(field, rule)
      messagesObj[key] = title
    }
  }

  return messagesObj
}

module.exports = { createMessagesObj, generateMessage }
