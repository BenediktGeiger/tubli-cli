import chalk from 'chalk'
import CliTable, {type Table} from 'cli-table3'

import {
  Meaning,
  MeaningTranslations,
  SingleSearchResult,
  SonapiResponse,
  Translation,
  WordForm,
} from '../../types/index.js'
import {OutputFormatStrategy} from '../format.strategy.js'

export class TableFormatStrategy implements OutputFormatStrategy {
  display(data: SonapiResponse): string {
    let resultString = ''
    for (const result of data.searchResult) {
      const wordFormsTable = this.getWordFormsTable(result)

      if (wordFormsTable) {
        resultString += ' Word Forms\n'
        resultString += wordFormsTable.toString() + '\n'
      }

      const translationsTable = this.getTranslationsTable(data.translations)

      if (translationsTable) {
        resultString += ' Translations\n'
        resultString += translationsTable.toString() + '\n'
      }

      resultString += ' Meanings\n'
      for (const meaning of result.meanings) {
        const meaningTable = this.getMeaningsTable(meaning)
        resultString += meaningTable.toString() + '\n'
      }
    }

    return resultString
  }

  private getMeaningsTable(meaning: Meaning): Table {
    const meaningTable = new CliTable({
      colWidths: [20, 80],
      wordWrap: true,
    })

    const {definition} = meaning

    const partOfSpeech = meaning.partOfSpeech?.reduce(
      (acc: string, pos: {code: string; value: string}) => `${pos.value}, ${acc}`,
      '',
    )
    const examples = meaning.examples?.slice(0, 3).join('\n') ?? ''
    const synonyms = meaning.synonyms?.slice(0, 5).join(', ') ?? ''
    const rection = meaning.rection ?? ''
    const translations = this.filterTranslations(meaning.translations).join('\n')

    if (definition) {
      meaningTable.push({Definition: definition})
    }

    if (partOfSpeech) {
      meaningTable.push({'Part of speech': partOfSpeech})
    }

    if (rection) {
      meaningTable.push({Rection: rection})
    }

    if (examples) {
      meaningTable.push({Examples: examples})
    }

    if (synonyms) {
      meaningTable.push({Synonyms: synonyms})
    }

    if (translations) {
      meaningTable.push({Translations: translations})
    }

    return meaningTable
  }

  private filterTranslations(translations: MeaningTranslations): string[] {
    const result: string[] = []

    for (const [lang, translationsList] of Object.entries(translations)) {
      const uniqueByWeight: {[weight: number]: string} = {}

      for (const translation of translationsList) {
        let {words, weight} = translation

        // If there are multiple words (comma-separated), limit them to the first 2 words
        const wordArray = words.split(',').map((w) => w.trim())
        if (wordArray.length >= 2) {
          words = wordArray.slice(0, 2).join(',')
        }

        if (uniqueByWeight[weight] === undefined) {
          uniqueByWeight[weight] = words
        }
      }

      const sortedByWeight = Object.entries(uniqueByWeight)
        .map(([weight, words]) => ({
          words,
          weight: Number.parseFloat(weight),
        }))
        .sort((a, b) => b.weight - a.weight) // Sort in descending order of weight

      const formattedString = `${lang}: ${sortedByWeight.map(({words, weight}) => `${words}(${weight})`).join(' | ')}`

      result.push(formattedString)
    }

    return result
  }

  private getWordFormsTable(searchResult: SingleSearchResult): Table | null {
    if (searchResult.wordClasses.length === 0) {
      return null
    }

    const wordFormTable = new CliTable()

    if (searchResult.wordClasses.includes('noomen')) {
      wordFormTable.push(
        {[chalk.green(this.getWordFormValue(searchResult, 'SgN'))]: this.getWordFormValue(searchResult, 'PlN')},
        {[chalk.green(this.getWordFormValue(searchResult, 'SgG'))]: this.getWordFormValue(searchResult, 'PlG')},
        {
          [chalk.green(this.getWordFormValue(searchResult, 'SgP'))]: chalk.green(
            this.getWordFormValue(searchResult, 'PlP'),
          ),
        },
      )
    }

    if (searchResult.wordClasses.includes('verb')) {
      wordFormTable.push(
        {[this.getWordFormValue(searchResult, 'Sup')]: this.getWordFormValue(searchResult, 'IndIpfSg3')},
        {[this.getWordFormValue(searchResult, 'Inf')]: this.getWordFormValue(searchResult, 'PtsPtIps')},
        {[this.getWordFormValue(searchResult, 'IndPrSg3')]: this.getWordFormValue(searchResult, 'PtsPtPs')},
      )
    }

    if (searchResult.wordClasses.includes('muutumatu')) {
      wordFormTable.push([this.getWordFormValue(searchResult, 'ID')])
    }

    return wordFormTable
  }

  private getWordFormValue(searchResult: SingleSearchResult, code: string): string {
    return searchResult.wordForms.find((wordForm: WordForm) => wordForm.code === code)?.value ?? ''
  }

  private getTranslationsTable(translations: Translation[]): Table | null {
    let combinedTranslations = ''

    if (translations.length === 0) {
      return null
    }

    for (const translation of translations) {
      combinedTranslations += translation.translations.join(',')
    }

    const translationTable = new CliTable({
      colWidths: [101],
      wordWrap: true,
    })

    translationTable.push([combinedTranslations])

    return translationTable
  }
}
