import {SonapiResponse} from '../types/index.js'

export interface OutputFormatStrategy {
  display(data: SonapiResponse): string
}
