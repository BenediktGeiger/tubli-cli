import {SonapiResponse} from '../types/index.js'
import {QueryFlags} from './context.js'

export interface OutputFormatStrategy {
  display(data: SonapiResponse, queryFlags: QueryFlags): string
}
