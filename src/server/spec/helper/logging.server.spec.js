const {logger} = require('../../helper/logging')

describe('logging', () => {
  it('should instantiate', () => {
    expect(logger).toBeTruthy();
    expect(logger.trace).toBeTruthy();
    expect(logger.debug).toBeTruthy();
    expect(logger.info).toBeTruthy();
    expect(logger.warn).toBeTruthy();
    expect(logger.error).toBeTruthy();
  })
})
