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

function addJobs (lot) {
  const inProcess = Queue.create('inProcess', { lotId: lot.id })
    .delay(new Date(lot.startTime))
    .removeOnComplete(true)
    .save(async err => {
      if (err) throw err
      lot.inProcessJobId = inProcess.id
      await lot.save()
    })

  const closed = Queue.create('closed', { lotId: lot.id })
    .delay(new Date(lot.endTime))
    .removeOnComplete(true)
    .save(async err => {
      if (err) throw err
      lot.closedJobId = closed.id
      await lot.save()
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

module.exports = { addJobs, updateJob, removeJob }
