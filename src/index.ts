import {Args, Command, Flags} from '@oclif/core'
import axios from 'axios'
import chalk from 'chalk'

import {SONAPI_API_URL} from './constants/index.js'
import {OutputContext} from './output/index.js'
import {SonapiResponse} from './types/index.js'

export default class Tubli extends Command {
  static args = {
    word: Args.string({description: 'Estonian or English Word you want to query the API with', required: true}),
  }

  static description = 'The TUBLI Command Line Interface is a unified tool to query the sonapi API (sonapi.ee)'

  static examples = [
    `<%= config.bin %> <%= command.id %> maja`,
    `<%= config.bin %> <%= command.id %> maja -m=plain`,
    `<%= config.bin %> <%= command.id %> maja -m=json`,
    `<%= config.bin %> <%= command.id %> maja -m=table`,
    `<%= config.bin %> <%= command.id %> house -l=en`,
    `<%= config.bin %> <%= command.id %> house -l=en -m=json`,
  ]

  static flags = {
    mode: Flags.string({
      char: 'm',
      description: 'mode to run in',
      options: ['table', 'plain', 'json'],
      default: 'table',
    }),
    language: Flags.string({
      char: 'l',
      default: 'et',
      description: 'Language to search in',
      required: false,
      options: ['et', 'en'],
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Tubli)

    const url = `${SONAPI_API_URL}${args.word}?lg=${flags.language}`

    try {
      const result = await axios.get(url)

      const apiResponses = result.data as SonapiResponse

      if (apiResponses.searchResult.length === 0) {
        this.log(`No results for "${args.word}" while calling ${chalk.yellow(url)}`)
        return
      }

      const outputContext = new OutputContext(flags.mode as 'json' | 'plain' | 'table')

      this.log(outputContext.displayData(apiResponses))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const status = error?.response?.status ?? error?.response?.data?.status

      if (!status) {
        this.error(`Unable to reach ${SONAPI_API_URL}`)
      }

      const errorMessage = chalk.red(error?.response?.data?.message ?? error?.message ?? 'Unknown error')

      this.log(`Error (${status}) while calling ${chalk.yellow(url)}\n${errorMessage}`)
    }
  }
}
