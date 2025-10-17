// Error handling Enum
const ERROR_HANDLING = {
  continue: 'continue',
  stop: 'stop'
}
Object.freeze(ERROR_HANDLING)

const $internals = {
  status: {
    running: false,
    stopAtEnd: false
  },
  logger: console,
  errorHandling: ERROR_HANDLING.continue,
  steps: [],
  loop: Promise.resolve(),
  createStep: (index) => {
    return (result) => {
      const { steps, status, errorHandling } = $internals

      if (!status.running) {
        return Promise.reject(new Error('Operation halted: loop execution was stopped by the user.'))
      }

      return steps[index](result).catch((error) => {
        if (errorHandling === ERROR_HANDLING.continue) {
          $internals.logger.warn(`Step ${index + 1} failed, continuing loop. Error:`, error)
          return result
        } else {
          $internals.logger.error(`Step ${index + 1} failed, stopping loop. Error:`, error)
          status.running = false
          throw error
        }
      })
    }
  },
  runOnce: () => {
    let { loop } = $internals
    const { createStep, status, steps } = $internals

    status.running = true

    for (let i = 0; i < steps.length; i++) {
      loop = loop.then(createStep(i))
    }

    // Last step to indicate end of steps.
    loop = loop.then((result) => {
      status.running = false
      return result
    })

    return loop
  },
  runLoop: async () => {
    const { runOnce, status } = $internals

    return new Promise((resolve, reject) => {
      const next = () => {
        runOnce()
          .then((result) => {
            if (status.stopAtEnd) {
              status.running = false
              return resolve(result)
            }
            next()
          })
      }

      next()
    })
  },
  init: (options) => {
    if (options) {
      const {
        errorHandling,
        logger,
        steps
      } = options

      // Add Steps from options
      if (steps) {
        $internals.steps = steps
      }

      // Add Error Handling method from options
      if (errorHandling) {
        $internals.errorHandling = errorHandling
      }

      // Add Logger from options
      if (logger) {
        $internals.logger = logger
      }
    }

    return {
      running: $internals.status.running,
      runOnce: () => {
        return $internals.runOnce()
      },
      start: async () => {
        const { runLoop, status } = $internals

        if (!status.running) {
          return runLoop()
        }
      },
      stop: () => {
        const { status } = $internals

        status.running = false
      },
      stopAtEnd: () => {
        const { status } = $internals

        status.stopAtEnd = true
      }
    }
  }
}

module.exports = $internals.init
