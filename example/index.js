const stepPromiseLooper = require('step-promise-looper')

const looper = stepPromiseLooper({
  steps: [
    (result) => {
      console.log('step 1')
      return Promise.resolve('step 1')
    },
    (result) => {
      console.log('step 2')
      return new Promise(resolve => {
        setTimeout(() => {
          console.log('timeout')
          resolve('timeout')
        }, 5000)
      })
    }
  ]
})

looper.start()

// run through the steps only once
// looper.runOnce()

// force the loop to stop.
// looper.stop()

// gracefully stop the loop on the last step.
// looper.stopAtEnd()
