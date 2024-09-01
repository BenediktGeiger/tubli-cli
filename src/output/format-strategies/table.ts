import chalk from 'chalk'
import CliTable, {type Table} from 'cli-table3'

import {Meaning, SingleSearchResult, SonapiResponse, Translation, WordForm} from '../../types/index.js'
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
    const synonyms = meaning.synonyms?.join(', ') ?? ''

    // TODO add translations

    if (definition) {
      meaningTable.push({Definition: definition})
    }

    if (partOfSpeech) {
      meaningTable.push({'Part of speech': partOfSpeech})
    }

    if (examples) {
      meaningTable.push({Examples: examples})
    }

    if (synonyms) {
      meaningTable.push({Synonyms: synonyms})
    }

    return meaningTable
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
