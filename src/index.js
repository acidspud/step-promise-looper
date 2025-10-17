const $internals = {
  status: {
    running: false,
    stopAtEnd: false
  },
  steps: [],
  loop: Promise.resolve(),
  createStep: (index) => {
    return (result) => {
      const { steps, status } = $internals

      if (!status.running) {
        return Promise.reject(new Error('Loop stop forced.'))
      }

      return steps[index](result)
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
      return Promise.resolve(result)
    })

    return loop
  },
  runLoop: async () => {
    const { runOnce, runLoop, status } = $internals

    return runOnce().then((result) => {
      if (status.stopAtEnd) {
        status.running = false
        return Promise.resolve(result)
      }

      return runLoop()
    })
  },
  init: (options) => {
    if (options) {
      const { steps } = options

      if (steps) {
        $internals.steps = steps
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
