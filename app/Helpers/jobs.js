'use strict'

const Kue = use('kue')
const Event = use('Event')
const Queue = Kue.createQueue()

function addOrUpdateJob (lot, update) {
  if (update) {
    Queue.get(lot.inProcessJobId, job => {
      job.set('created_at', new Date().getTime())
      job.delay(new Date(lot.startTime)).save(err => {
        console.log(err)
      })
    })

    Queue.get(lot.closedJobId, job => {
      job.set('created_at', new Date().getTime())
      job.delay(new Date(lot.startTime)).save(err => {
        console.log(err)
      })
    })
  } else {
    Queue.create('inProcess', { lotId: lot.id })
      .delay(new Date(lot.startTime))
      .removeOnComplete(true)
      .save()

    Queue.create('closed', { lotId: lot.id })
      .delay(new Date(lot.endTime))
      .removeOnComplete(true)
      .save()
  }
}

Queue.process('inProcess', function (job, done) {
  Event.fire('inProcessLot', { id: job.data.lotId })
  done()
})

Queue.process('closed', function (job, done) {
  Event.fire('closedLot', { id: job.data.lotId })
  done()
})

module.exports = addOrUpdateJob
