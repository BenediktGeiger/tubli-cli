import {SonapiResponse} from '../types/index.js'
import {OutputFormatStrategy} from './format.strategy.js'
import {JsonOutputFormatStrategy} from './format-strategies/json.js'
import {PlainOutputFormatStrategy} from './format-strategies/plain.js'
import {TableFormatStrategy} from './format-strategies/table.js'

export type OutputFormat = 'json' | 'plain' | 'table'

export class OutputContext {
  private strategy: OutputFormatStrategy
  constructor(mode: OutputFormat) {
    this.strategy = new TableFormatStrategy() // Default strategy

    if (mode === 'plain') {
      this.setStrategy(new PlainOutputFormatStrategy())
    }

    if (mode === 'table') {
      this.setStrategy(new TableFormatStrategy())
    }

    if (mode === 'json') {
      this.setStrategy(new JsonOutputFormatStrategy())
    }
  }

  setStrategy(strategy: OutputFormatStrategy) {
    this.strategy = strategy
  }

  displayData(data: SonapiResponse): string {
    return this.strategy.display(data)
  }
}
