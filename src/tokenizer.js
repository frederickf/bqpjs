import Token from './token'
import rules from './rules'
import validator from './validator'

export default function createTokenizer(userRules, defaultOperation) {
  return function (searchStr) {
    let tokens = createBaseTokens(searchStr, userRules)

    // This must be done before whitespace is stripped because quotes can
    // contain whitespace we need to be preserved as part of a term
    if (!!tokens.find(token=>token.type === rules.quote.type)) {
      tokens = createTermsFromQuotes(tokens)
    }

    tokens = stripRepeatedWhiteSpace(tokens)

    if (defaultOperation) {
      tokens = convertWhiteSpaceToDefaultOperator(tokens, defaultOperation)
    }

    tokens = tokens.filter((token) => {
      return token.type !== rules.space.type
    })

    tokens = validator(tokens)

    return tokens
  }
}

function createBaseTokens(searchStr, rules) {
  let currentStr = ''
  let tokens = []

  for (let currentIndex = 0; currentIndex < searchStr.length; currentIndex++) {
    currentStr += searchStr.charAt(currentIndex)

    for (const rule of rules) {
      let matchStart = rule.test(currentStr)

      if (matchStart !== -1 ) {
        let nonTerm = currentStr.slice(matchStart)

        if (matchStart > 0 ) {
          // We've found a nonTerm at the end of a term
          // EX: termAND or term) or term" or term' '  (with a space at the end)
          let term = currentStr.slice(0, matchStart)
          tokens.push(Token.create(term, 'term', currentIndex - nonTerm.length))
        }

        tokens.push(Token.create(nonTerm, rule.type, currentIndex, rule.operation))
        currentStr = ''
        break
      }
    }
  }

  if (currentStr !== '') {
    // We've iterated to the end of the search string but we have some
    // unmatched string remaining, must be a term
    tokens.push(Token.create(currentStr, 'term', searchStr.length - 1))
  }

  return tokens
}

function stripRepeatedWhiteSpace(tokens) {
  const newTokens = []
  let previousToken = {type: null}

  for (const currentToken of tokens) {
    if (currentToken.type === 'whitespace') {
      if (previousToken.type !== 'whitespace') {
        newTokens.push(currentToken)
      }
    }
    else {
      newTokens.push(currentToken)
    }
    previousToken = currentToken
  }

  return newTokens
}

function convertWhiteSpaceToDefaultOperator(tokens, defaultOperation) {
  for (let i = 0; i < tokens.length; i++) {
    let previousToken = i === 0 ? {type: null} : tokens[i - 1]
    let currentToken = tokens[i]
    let nextToken = i + 1 === tokens.length ? {type: null} : tokens[i + 1]

    if (currentToken.type === 'whitespace') {
      if (
        // A B
        (previousToken.type === 'term' && nextToken.type === 'term') ||
        // (A B) C
        (previousToken.operation === 'close' && nextToken.type === 'term') ||
        // (A B) (C D)
        (previousToken.operation === 'close' && nextToken.operation === 'open') ||
        // A NOT B or A NOT (B C)
        (nextToken.operation === 'NOT' && (previousToken.type === 'term' || previousToken.operation === 'close'))
      ) {
        // This will be a token with a value of ' ', but a type and operation of an operator
        let newToken = Token.create(
          currentToken.value,
          'operator',
          currentToken.position.end,
          defaultOperation
        )
        tokens.splice(i, 1, newToken)
      }
    }
  }

  return tokens
}

function createTermsFromQuotes(tokens) {
  const newTokens = []
  let quoteMode = false
  let currentValue = ''
  let lastQuoteToken = null

  for (const currentToken of tokens) {
    if (quoteMode) {
        if (currentToken.type === `quote`) {
          newTokens.push(Token.create(currentValue, 'term', currentToken.position.end - 1))
          currentValue = ''
          quoteMode = false
        }
        else {
          currentValue += currentToken.value
        }
    }
    else {
      if (currentToken.type === `quote`) {
        lastQuoteToken = currentToken
        quoteMode = true
      }
      else {
        newTokens.push(currentToken)
      }
    }
  }

  if (quoteMode) {
    throw new Error(`Unmatched quote at ${lastQuoteToken.position.start}`)
  }

  return newTokens
}
