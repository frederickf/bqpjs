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

          if (this.ruleNames[i] === 'quote') {
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
      // We're iterated to the end of the search string but we have some
      // unmatched string remaining, must be a term
      tokens.push(createToken(currentStr, 'term', searchStr.length - 1))
    }

    if (quotes) {
      tokens = createTermsFromQuotes(tokens)
      tokens = removeTokens(tokens, (token) => {
        return token.value === this.rules.quote.name
      })
    }
    tokens = stripRepeatedWhiteSpace(tokens)
    tokens = convertWhiteSpaceToDefaultOperator(tokens, '+')
    tokens = removeTokens(tokens, (token) => {
      return token.value === this.rules.space.name
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

function convertWhiteSpaceToDefaultOperator(tokens, defaultOperator) {

  for (let i = 0; i < tokens.length; i++) {
    let previousToken = i === 0 ? {type: null} : tokens[i - 1]
    let currentToken = tokens[i]
    let nextToken = i + 1 === tokens.length ? {type: null} : tokens[i + 1]

    if (previousToken.type === 'term' && nextToken.type === 'term') {
      // Using the whitespace start and end works becuase the only valid
      // options will be + (and) or - (or)
      let newToken = createToken(
        defaultOperator,
        'operator',
        currentToken.position.end
      )
      tokens.splice(i, 1, newToken)
    }
  }

  return tokens
}

function stripWhiteSpace(tokens) {
  const newTokens = []

  while(tokens.length) {
    let currentToken = tokens.shift()

    if (currentToken.type !== 'whitespace') {
      newTokens.push(currentToken)
    }
  }

  return newTokens
}


function createTermsFromQuotes(tokens) {
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

function stripQuotes(tokens) {
  const newTokens = []

  while(tokens.length) {
    let currentToken = tokens.shift()

    if (currentToken.type !== 'quote') {
      newTokens.push(currentToken)
    }
  }

  return newTokens
}

function createToken(value, type, currentPosition) {
  const startPosition = calcStart(currentPosition, value.length)
  const endPosition = calcEnd(startPosition, value.length)
  return new Token(value, type, startPosition, endPosition)
}

/*
  If test returns false, token is not removed
  EX: function below will remove all quote tokens
  function (token) {
    return token.value === 'quote'
  }
*/

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

// Assumes zero based index
function calcStart(position, length) {
  return position - (length - 1)
}

// Assumes zero based index
function calcEnd(position, length) {
  return position + (length - 1)
}

module.exports = Lexer
