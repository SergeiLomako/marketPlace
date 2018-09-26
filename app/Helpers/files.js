'use strict'

const { sanitizor } = use('Validator')
const moment = use('moment')
const Drive = use('Drive')

async function upload (request, file, path, title) {
  const image = request.file(file, {
    types: ['image'],
    size: '2mb'
  })
  const imageName = `${sanitizor.slug(title)}-${moment().unix()}.${image.subtype}`

  await image.move(path, {
    name: imageName
  })

  return image.moved() ? imageName : image.error()
}

async function unlink (path) {
  if (await Drive.exists(path)) {
    await Drive.delete(path)
  }
}

module.exports = { upload, unlink }
