import Token from '../token'
import { flatMap } from '../util'

const matchToToken = (match) => {
  let tokens = []
  const { subStr, matchStart, currentIdx, type, operation} = match

  if (matchStart >= 0) {
    let nonTerm = subStr.slice(matchStart)
    if (matchStart > 0 ) {
      // We've found a match prefixed with a term
      // EX: termAND or term) or term" or term' '  (with a space at the end)
      let term = subStr.slice(0, matchStart)
      tokens.push(Token.create(term, 'term', currentIdx - nonTerm.length))
    }
    tokens.push(Token.create(nonTerm, type, currentIdx, operation))
  }
  else {
    // Anything not a match must be a term
    tokens.push(Token.create(subStr, 'term', currentIdx - 1))
  }

  return tokens
}

const matchesToTokens = flatMap(matchToToken)

export default matchesToTokens
