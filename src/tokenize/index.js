import rules from '../rules'
import findMatches from './find-matches'
import matchesToTokens from './matches-to-tokens'
import createTermsFromQuotes from './create-terms-from-quotes'
import removeToken from './remove-token'
import insertDefaultOperator from './insert-defaut-operator'
import validate from './validate'
import { composeLeft } from '../util'

export default (userRules, defaultOperation) => {
  return composeLeft(
    findMatches(userRules),
    matchesToTokens,
    // createTermsFromQuotes must be done before whitespace is stripped
    createTermsFromQuotes,
    removeToken(rules.space.type),
    insertDefaultOperator(defaultOperation),
    validate
  )
}
