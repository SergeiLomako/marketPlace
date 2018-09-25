'use strict'

const { sanitizor } = use('Validator')
const Moment = use('moment')
const Helpers = use('Helpers')
const removeFile = Helpers.promisify(require('fs').unlink)

async function upload (request, file, path, title) {
  const image = request.file(file, {
    types: ['image'],
    size: '2mb'
  })
  const imageName = `${sanitizor.slug(title)}-${Moment().unix()}.${image.subtype}`

  await image.move(path, {
    name: imageName
  })

  return image.moved() ? imageName : image.error()
}

function unlink (path) {
  removeFile(path)
}

module.exports = { upload, unlink }
