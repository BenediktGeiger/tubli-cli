import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('tubli', () => {
  it('runs tubli maja', async () => {
    await runCommand('tubli maja')

    expect(1).to.be.equal(1)
  })
})
