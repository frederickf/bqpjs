const Token = require('./token')

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
      // We're iterated to the end of the search string but we have some
      // unmatched string remaining, must be a term
      tokens.push(Token.create(currentStr, 'term', searchStr.length - 1))
    }

    if (quotes) {
      tokens = createTermsFromQuotes(tokens)
      tokens = removeTokens(tokens, (token) => {
        return token.type === this.rules.quote.type
      })
    }
    tokens = stripRepeatedWhiteSpace(tokens)
    tokens = convertWhiteSpaceToDefaultOperator(tokens, this.defaultOperation)
    tokens = removeTokens(tokens, (token) => {
      return token.type === this.rules.space.type
    })

    return tokens
  }
}

function stripRepeatedWhiteSpace(tokens) {
  const newTokens = []
  let whiteSpaceMode = false

  while(tokens.length) {
    let currentToken = tokens.shift()

    if (currentToken.type === 'whitespace') {
      if (!whiteSpaceMode) {
        newTokens.push(currentToken)
        whiteSpaceMode = true
      }
    }
    else {
      newTokens.push(currentToken)
      whiteSpaceMode = false
    }
  }

  return newTokens
}

function convertWhiteSpaceToDefaultOperator(tokens, defaultOperation) {
  for (let i = 0; i < tokens.length; i++) {
    let previousToken = i === 0 ? {type: null} : tokens[i - 1]
    let currentToken = tokens[i]
    let nextToken = i + 1 === tokens.length ? {type: null} : tokens[i + 1]

    if (previousToken.type === 'term' && nextToken.type === 'term') {
      // This will be a token with a value of ' ', but a type and operation or an operator
      let newToken = Token.create(
        currentToken.value,
        'operator',
        currentToken.position.end,
        defaultOperation
      )
      tokens.splice(i, 1, newToken)
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
          newTokens.push(currentToken)
          currentValue = ''
          quoteMode = false
        }
        else {
          currentValue += currentToken.value
        }
    }
    else {
      if (currentToken.type === `quote`) {
        newTokens.push(currentToken)
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


function removeTokens(tokens, test) {
  const newTokens = []

  while(tokens.length) {
    let currentToken = tokens.shift()

    if (!test(currentToken)) {
      newTokens.push(currentToken)
    }
  }

  return newTokens
}

module.exports = Lexer
