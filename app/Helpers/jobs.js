'use strict'

const Kue = use('kue')
const Event = use('Event')
const Queue = Kue.createQueue({ jobEvents: false })

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

function updateJobs (lot) {
  Queue.delayed((err, ids) => {
    if (err) throw err
    ids.forEach(id => {
      Kue.Job.get(id, (err, job) => {
        if (err) throw err
        if (id === lot.inProcessJobId) {
          job.set('created_at', new Date().getTime())
          job.delay(new Date(lot.startTime))
            .save(err => { if (err) throw err })
        }
        if (id === lot.closedJobId) {
          job.set('created_at', new Date().getTime())
          job.delay(new Date(lot.endTime))
            .save(err => { if (err) throw err })
        }
      })
    })
  })
}

function removeJobs (lot) {
  Queue.delayed((err, ids) => {
    if (err) throw err
    ids.forEach(id => {
      Kue.Job.get(id, (err, job) => {
        if (err) throw err
        if (id === lot.inProcessJobId) {
          job.remove(err => { if (err) throw err })
        }
        if (id === lot.closedJobId) {
          job.remove(err => { if (err) throw err })
        }
      })
    })
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

module.exports = { addJobs, updateJobs, removeJobs }
