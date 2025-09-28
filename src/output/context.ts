import {SonapiResponse} from '../types/index.js'
import {OutputFormatStrategy} from './format.strategy.js'
import {JsonOutputFormatStrategy} from './format-strategies/json.js'
import {PlainOutputFormatStrategy} from './format-strategies/plain.js'
import {TableFormatStrategy} from './format-strategies/table.js'

export type OutputFormat = 'json' | 'plain' | 'table'

export type QueryFlags = {
  queryWordForms: boolean
  queryTranslations: boolean
  meanings: {
    queryDefinition: boolean
    queryPartOfSpeech: boolean
    queryRection: boolean
    queryExamples: boolean
    querySynonyms: boolean
    queryMeaningTranslations: boolean
  }
}

export class OutputContext {
  private strategy: OutputFormatStrategy

  private query: string
  private isValidQuery = true

  private queryFlags: QueryFlags = {
    queryWordForms: false,
    queryTranslations: false,
    meanings: {
      queryDefinition: false,
      queryPartOfSpeech: false,
      queryRection: false,
      queryExamples: false,
      querySynonyms: false,
      queryMeaningTranslations: false,
    },
  }

  // TODO the following
  // ./bin/dev.js maja --query="wordforms[*],translations[*],meanings[definition,partofspeech]"
  // is an invalid query double check

  private wordFormRegex = /^wordforms\[\*]$/
  private translationRegex = /^translations\[\*]$/
  private allMeaningsRegex = /^meanings\[\*]$/
  private partialMeaningsRegex =
    /^meanings\[(definition|partofspeech|rection|examples|synonyms|translations)(\| ?(definition|partofspeech|rection|examples|synonyms|translations))*]$/

  constructor(mode: OutputFormat, query: string) {
    this.query = query
    this.validateQuery()
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
    return this.strategy.display(data, this.queryFlags)
  }

  private validateQuery() {
    const parts = this.query.split(',').map((part) => part.trim())

    for (const part of parts) {
      if (this.wordFormRegex.test(part)) {
        this.queryFlags.queryWordForms = true
        continue
      }

      if (this.translationRegex.test(part)) {
        this.queryFlags.queryTranslations = true
        continue
      }

      if (this.allMeaningsRegex.test(part)) {
        this.queryFlags.meanings.queryDefinition = true
        this.queryFlags.meanings.queryPartOfSpeech = true
        this.queryFlags.meanings.queryExamples = true
        this.queryFlags.meanings.querySynonyms = true
        this.queryFlags.meanings.queryMeaningTranslations = true
        continue
      }

      if (this.partialMeaningsRegex.test(part)) {
        const fields = part.split('[')[1].replace(']', '').split('|')
        console.log('fields', fields)
        if (fields.includes('definition')) {
          this.queryFlags.meanings.queryDefinition = true
        }

        if (fields.includes('partofspeech')) {
          this.queryFlags.meanings.queryPartOfSpeech = true
        }

        if (fields.includes('examples')) {
          this.queryFlags.meanings.queryExamples = true
        }

        if (fields.includes('synonyms')) {
          this.queryFlags.meanings.querySynonyms = true
        }

        if (fields.includes('translations')) {
          this.queryFlags.meanings.queryMeaningTranslations = true
        }

        if (fields.includes('rection')) {
          this.queryFlags.meanings.queryRection = true
        }

        continue
      }

      this.isValidQuery = false
    }

    if (!this.isValidQuery) {
      throw new Error('Invalid query', {cause: 'QUERY_ERROR'})
    }
  }
}
