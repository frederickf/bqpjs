import Token from '../token'

const createTermsFromQuotes = (tokens) => {
  const newTokens = []
  let currentValue = ''
  let unclosedQuoteToken = null

  for (const currentToken of tokens) {
    if (unclosedQuoteToken === null) {
      if (currentToken.type === 'quote') {
        unclosedQuoteToken = currentToken
      }
      else {
        newTokens.push(currentToken)
      }
    }
    else {
      if (currentToken.type === 'quote') {
        newTokens.push(Token.create(currentValue, 'term', currentToken.position.end - 1))
        currentValue = ''
        unclosedQuoteToken = null
      }
      else {
        currentValue += currentToken.value
      }
    }
  }

  if (unclosedQuoteToken !== null) {
    throw new Error(`Unmatched quote at ${unclosedQuoteToken.position.start}`)
  }

  return newTokens
}

export default createTermsFromQuotes
