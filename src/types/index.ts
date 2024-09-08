export type WordForm = {
  inflectionType: string
  code: string
  morphValue: string
  value: string
}

export type MeaningTranslation = {
  words: string
  weight: number
}

export type MeaningTranslations = {
  [languageCode: string]: MeaningTranslation[]
}

export type Meaning = {
  definition: string
  synonyms: string[]
  examples: string[]
  rection: string
  partOfSpeech: {
    code: string
    value: string
  }[]
  translations: MeaningTranslations
}

export type WordClasses = string

export type SingleSearchResult = {
  wordClasses: WordClasses[]
  wordForms: WordForm[]
  meanings: Meaning[]
  similarWords: string[]
}
export type Translation = {
  from: 'en' | 'et'
  to: 'en' | 'et'
  input: string
  translations: string[]
}

export type SonapiResponse = {
  searchTerm: string
  estonianWord: string
  searchResult: SingleSearchResult[]
  translations: Translation[]
}
