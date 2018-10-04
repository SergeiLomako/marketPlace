'use strict'

const Kue = use('kue')
const Env = use('Env')
const Event = use('Event')
const Queue = Kue.createQueue({
  redis: {
    host: Env.get('REDIS_HOST', '127.0.0.1'),
    port: Env.get('REDIS_PORT', 6379)
  },
  jobEvents: false
})

function addJob (title, data, time) {
  return new Promise((resolve, reject) => {
    const Job = Queue.create(title, data)
      .delay(new Date(time))
      .removeOnComplete(true)
      .save(async err => {
        if (err) reject(err)
        resolve(Job.id)
      })
  })
}

function updateJob (id, date) {
  Kue.Job.get(id, (err, job) => {
    if (err) throw err
    job.set('created_at', new Date().getTime())
    job.delay(new Date(date))
      .save(err => { if (err) throw err })
  })
}

function removeJob (id) {
  Kue.Job.get(id, (err, job) => {
    if (err) throw err
    job.remove(err => { if (err) throw err })
  })
}

Queue.process('inProcess', function (job, done) {
  Event.fire('inProcessLot', { id: job.data.lotId })
  done()
})

Queue.process('closed', function (job, done) {
  Event.fire('closedLot', { id: job.data.lotId })
  done()
})

module.exports = { addJob, updateJob, removeJob }
