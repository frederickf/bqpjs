import Token from './token'

class Lexer {

  constructor(rules, ruleNames, defaultOperation) {
    this.rules = rules
    this.ruleNames = ruleNames
    this.defaultOperation = defaultOperation
  }

  createTokens(searchStr) {
    let currentStr = ''
    let currentPosition = 0
    let tokens = []
    let quotes = false

    while (currentPosition < searchStr.length) {
      currentStr += searchStr.charAt(currentPosition)

      for (let i = 0; i < this.ruleNames.length; i++) {
        let rule = this.rules[this.ruleNames[i]]
        let matchStart = rule.test(currentStr)

        if (matchStart !== -1 ) {
          let nonTerm = currentStr.slice(matchStart)

          if (rule.type === 'quote') {
            quotes = true
          }

          if (matchStart > 0 ) {
            // We've found a nonTerm at the end of a term
            // EX: termAND or term) or term" or term' '  (with a space at the end)
            let term = currentStr.slice(0, matchStart)
            tokens.push(Token.create(term, 'term', currentPosition - nonTerm.length))
          }

          tokens.push(Token.create(nonTerm, rule.type, currentPosition, rule.operation))

          currentStr = ''
        }
      }

      currentPosition++
    }

    if (currentStr !== '') {
      // We've iterated to the end of the search string but we have some
      // unmatched string remaining, must be a term
      tokens.push(Token.create(currentStr, 'term', searchStr.length - 1))
    }

    if (quotes) {
      tokens = createTermsFromQuotes(tokens)
    }

    tokens = stripRepeatedWhiteSpace(tokens)
    if (this.defaultOperation) {
      tokens = convertWhiteSpaceToDefaultOperator(tokens, this.defaultOperation)
    }
    tokens = tokens.filter((token) => {
      return token.type !== this.rules.space.type
    })

    return tokens
  }
}

function stripRepeatedWhiteSpace(tokens) {
  const newTokens = []
  let previousToken = {type: null}

  while(tokens.length) {
    let currentToken = tokens.shift()

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
        (previousToken.type === 'term' && nextToken.type === 'term') ||
        (previousToken.operation === 'close' && nextToken.operation === 'open') ||
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

  while(tokens.length) {
    let currentToken = tokens.shift()

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
    throw new Error(`Unclosed quote at ${lastQuoteToken.position.start}`)
  }

  return newTokens
}

export default Lexer
