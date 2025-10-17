import test from 'ava'
import stepPromisedLoopModule from '../src/index.js'

const $internals = {
  steps: (t) => ({
    success: [
      (result) => {
        t.log('Step1: result: ', result)
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              msg: 'Step1 - testData!!'
            })
          }, 1000)
        })
      },
      (result) => {
        t.log('Step2: result: ', result)

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              msg: 'Step2 - testData!!'
            })
          }, 2000)
        })
      },
      (result) => {
        t.log('Step3: result: ', result)
        return Promise.resolve({
          msg: 'Step3 - testData!!'
        })
      }
    ],
    fail: [
      (result) => {
        t.log('Step1: result:', result)
        return Promise.resolve({
          msg: 'Step1 - testData!!'
        })
      },
      (result) => {
        t.log('Promise.reject following: result:', result)
        return Promise.reject(new Error('Intentionally throwing a error in the step.'))
      },
      (result) => {
        t.log('Step3', result)
        return Promise.resolve({
          msg: 'Step3 - testData!!'
        })
      }
    ],
    longRunning: [
      (result) => {
        t.log('Step1', result)
        return Promise.resolve({
          msg: 'Step1 - testData!!'
        })
      },
      (result) => {
        t.log('Step2: Resolve after 5 seconds.', result)
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              msg: 'Step2 - testData!!'
            })
          }, 5000)
        })
      },
      (result) => {
        t.log('Step3: should not reach this step.', result)
        return Promise.resolve({
          msg: 'Step3 - testData!!'
        })
      }
    ]
  })
}

// -- Step Tests
test('Test for the Promise Loop - start LOOP', async (t) => {
  const { steps } = $internals
  const { success } = steps(t)

  let loopCounter = 0

  const counterStep = (result) => {
    t.log('Step4: result: ', result)
    loopCounter++
    return Promise.resolve({
      msg: 'Step4 - testData!!'
    })
  }

  success.push(counterStep)

  const promiseLoop = stepPromisedLoopModule({
    steps: success,
    logger: console
  })

  const stopAfter5Seconds = new Promise((resolve) => {
    setTimeout(() => {
      t.log('Resolved the loop stop after 5 seconds.')
      promiseLoop.stopAtEnd()
      resolve()
    }, 5000)
  })

  // Check if object init correctly
  t.log('Init - Start LOOP.')
  t.is(typeof promiseLoop, 'object')

  // Run through the steps once
  try {
    t.log('Start the loop.')
    await Promise.all([promiseLoop.start(), stopAfter5Seconds])
  } catch (error) {
    t.log(error)
  }

  t.is(loopCounter, 2)
  t.log('End of loop.')
})

test('Test for the Promise Loop - Successful Steps.', async (t) => {
  const { steps } = $internals
  const { success } = steps(t)

  const promiseLoop = stepPromisedLoopModule({
    steps: success,
    logger: console
  })

  // Check if object init correctly
  t.log('Init Successful Steps.')
  t.is(typeof promiseLoop, 'object')

  // Run through the steps once
  try {
    t.log('Start the Steps.')
    const data = await promiseLoop.runOnce()

    t.log('Run All steps', data)
    t.pass()
  } catch (error) {
    t.fail(error)
  }

  t.log('End the loop.')
})

test('Test for the Promise Loop - Failed Step.', async (t) => {
  const { steps } = $internals
  const { fail } = steps(t)

  const promiseLoop = stepPromisedLoopModule({
    steps: fail,
    logger: console
  })

  // Check if object init correctly
  t.log('Init - Failed Step.')
  t.is(typeof promiseLoop, 'object')

  // Run through the steps once
  try {
    t.log('Start the loop.')

    const data = await promiseLoop.runOnce()

    t.log('Should not reach this spot.', data)
  } catch (error) {
    t.log(error)
    t.pass(error)
  }

  t.log('End of loop.')
})

test('Test for the Promise Loop - Long Running Step.', async (t) => {
  const { steps } = $internals
  const { longRunning } = steps(t)

  const promiseLoop = stepPromisedLoopModule({
    steps: longRunning,
    logger: console
  })

  const stopAfter2Seconds = new Promise((resolve) => {
    setTimeout(() => {
      t.log('Resolved the step, stop after 2 seconds.')
      promiseLoop.stop()
      resolve()
    }, 2000)
  })

  // Check if object init correctly
  t.log('Init - Long Running Step.')
  t.is(typeof promiseLoop, 'object')

  // Run through the steps once
  try {
    t.log('Start the processing steps. Then after 2 seconds, stop it.')
    const data = await Promise.all([stopAfter2Seconds, await promiseLoop.runOnce()])

    t.log('Should not reach this spot.', data)
    t.fail()
  } catch (error) {
    t.log(error)
    t.pass()
  }

  t.log('End of loop.')
})

test('Test for the Promise Loop - Continue on Error.', async (t) => {
  const { steps } = $internals
  const { fail } = steps(t)

  const promiseLoop = stepPromisedLoopModule({
    steps: fail,
    logger: console,
    errorHandling: 'continue'
  })

  // Check if object init correctly
  t.log('Init - Continue on Error.')
  t.is(typeof promiseLoop, 'object')

  // Run through the steps once
  try {
    t.log('Start the loop.')

    const data = await promiseLoop.runOnce()

    t.log('Should reach this spot.', data)
    t.pass()
  } catch (error) {
    t.log(error)
    t.fail(error)
  }

  t.log('End of loop.')
})

test('Test for the Promise Loop - Stop on Error.', async (t) => {
  const { steps } = $internals
  const { fail } = steps(t)

  const promiseLoop = stepPromisedLoopModule({
    steps: fail,
    logger: console,
    errorHandling: 'stop'
  })

  // Check if object init correctly
  t.log('Init - Stop on Error.')
  t.is(typeof promiseLoop, 'object')

  // Run through the steps once
  try {
    t.log('Start the loop.')

    const data = await promiseLoop.runOnce()

    t.log('Should not reach this spot.', data)
    t.fail()
  } catch (error) {
    t.log(error)
    t.pass()
  }

  t.log('End of loop.')
})
