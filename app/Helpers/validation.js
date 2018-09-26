const messages = {
  required: '{field} is required',
  string: '{field} must be string',
  email: '{field} must be correct email address',
  unique: '{field} already exists',
  min: '{field} must be at least {value} characters',
  max: '{field} must be no more than {value} characters',
  date: '{field} must be correct date',
  dateFormat: '{field} must be date format: {value}',
  after: '{field} must be later than {value}',
  in: '{field} must match one value from the list: {value}',
  above: '{field} must be greater than {value}',
  before_offset_of: 'You must be over {value} years old',
  confirmed: '{field}s do not match',
  number: '{field} must be number'
}

function ucFirst (str) {
  return str[0].toUpperCase() + str.substring(1)
}

function generateMessage (field, rule) {
  let message = {}
  const attributes = rule.split(':')
  if (attributes.length > 1) {
    message.key = `${field}.${attributes[0]}`
    if (attributes[0] === 'in') {
      message.title = messages[attributes[0]].replace('{field}', ucFirst(field)).replace('{value}', attributes[1])
    } else {
      message.title = messages[attributes[0]].replace('{field}', ucFirst(field)).replace('{value}', attributes[1].split(',')[0])
    }
  } else {
    message.key = `${field}.${rule}`
    message.title = messages[rule].replace('{field}', ucFirst(field))
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
