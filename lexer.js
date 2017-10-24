const Token = require('./token')

class Lexer {

  constructor(rules, ruleNames) {
    this.rules = rules
    this.ruleNames = ruleNames
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
          let operator = currentStr.slice(matchStart)

          if (rule.name === 'quote') {
            quotes = true
          }

          if (matchStart > 0 ) {
            // We've found an operator at the end of a search term
            // EX: termAND or term) or term" or term' '  (with a space at the end)
            // Add it to tokens before the operator
            let term = currentStr.slice(0, matchStart)
            tokens.push(createToken(term, 'term', currentPosition - operator.length))
          }

          tokens.push(createToken(operator, rule.type, currentPosition))

          currentStr = ''
        }
      }

      currentPosition++
    }

    if (currentStr !== '') {
      // We're at the end of the search string but we have some current string left, must be a term
      tokens.push(createToken(currentStr, 'term', currentPosition))
    }

    if (quotes) {
      console.log('quotes found')
      tokens = fixQuotes(tokens)
    }

    return tokens
  }
}

function fixQuotes(tokens) {
  const newTokens = []
  let quoteMode = false
  let currentValue = ''
  let lastQuoteToken = null

  while(tokens.length) {
    let currentToken = tokens.shift()

    if (quoteMode) {
        if (currentToken.value === `"`) {
          newTokens.push(createToken(currentValue, 'term', currentToken.position.end - 1))
          newTokens.push(currentToken)
          currentValue = ''
          quoteMode = false
        }
        else {
          currentValue += currentToken.value
        }
    }
    else {
      if (currentToken.value === `"`) {
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

function createToken(value, type, currentPosition) {
  const startPosition = calcStart(currentPosition, value.length)
  const endPosition = calcEnd(startPosition, value.length)
  return new Token(value, type, startPosition, endPosition)
}

// Assumes zero based index
function calcStart(position, length) {
  return position - (length - 1)
}

// Assumes zero based index
function calcEnd(position, length) {
  return position + (length - 1)
}

module.exports = Lexer
