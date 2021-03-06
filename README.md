# step-promise-looper
Simple looping mechanism that steps through an array of Promises.

## Install:
```
npm install step-promise-looper --save
```

## Initialize:

```
const stepPromiseLooper = require('step-promise-looper')
```

## Create some steps:
Array of promises

```
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

```

## Control it:

```
// start the loop
looper.start();

// run through the steps only once
looper.runOnce()

// force the loop to stop.
looper.stop()

// gracefully stop the loop on the last step.
looper.stopAtEnd()

```

### Try It
* Visit the module at [npmjs.com](https://www.npmjs.com/package/step-promise-looper)
