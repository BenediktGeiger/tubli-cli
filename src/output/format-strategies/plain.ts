import {SonapiResponse} from '../../types/index.js'
import {OutputFormatStrategy} from '../format.strategy.js'

export class PlainOutputFormatStrategy implements OutputFormatStrategy {
  display(data: SonapiResponse): string {
    const response = []
    for (const result of data.searchResult) {
      response.push({
        wordForms: result.wordForms,
        meanings: result.meanings,
      })
    }

    return JSON.stringify({
      ...response,
      translations: data.translations,
    })
  }
}
