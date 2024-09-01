import cj from 'color-json'

import {SonapiResponse} from '../../types/index.js'
import {OutputFormatStrategy} from '../format.strategy.js'

export class JsonOutputFormatStrategy implements OutputFormatStrategy {
  display(data: SonapiResponse): string {
    const response = []
    for (const result of data.searchResult) {
      response.push({
        wordForms: result.wordForms,
        meanings: result.meanings,
      })
    }

    return cj(
      JSON.stringify(
        {
          ...response,
          translations: data.translations,
        },
        null,
        2,
      ),
    )
  }
}
