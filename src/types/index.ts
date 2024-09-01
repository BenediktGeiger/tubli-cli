export type WordForm = {
  inflectionType: string
  code: string
  morphValue: string
  value: string
}
export type Meaning = {
  definition: string
  synonyms: string[]
  examples: string[]
  partOfSpeech: {
    code: string
    value: string
  }[]
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
