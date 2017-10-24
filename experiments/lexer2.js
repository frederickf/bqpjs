
const Token = require('./token')

class Lexer {

  constructor(rules, ruleNames) {
    this.rules = rules
    this.ruleNames = ruleNames
  }

  createTokens(searchStr) {
    let currentStr = ''
    let currentPosition = 0
    let quoteMode = false
    //const searchArr = searchStr.split('')
    const tokens = []

    while (currentPosition < searchStr.length) {
      //currentStr += searchArr[currentPosition]
      currentStr += searchStr.charAt(currentPosition)
      let matchStart = -1
      let type = ''


      if (quoteMode) {
        // Accumulate currentStr until we find closing quote
        matchStart = this.rules[`quote`].test(currentStr)
        if (matchStart > 0) {
          type = `quote`
          quoteMode = false
        }
      }
      else {
        for (let i = 0; i < this.ruleNames.length; i++) {
          let rule = this.rules[this.ruleNames[i]]
          matchStart = rule.test(currentStr)

          if (matchStart !== -1 ) {
            type = rule.type
            if (this.ruleNames[i] === `quote`) {
              quoteMode = true
            }
            break
          }
        }
      }

      if (matchStart === 0) {
        let operator = currentStr.slice(matchStart)
        tokens.push(createToken(operator, type, currentPosition))
        currentStr = ''
      }

      if (matchStart > 0) {
        let operator = currentStr.slice(matchStart)
        let term = currentStr.slice(0, matchStart)
        tokens.push(createToken(term, 'term', currentPosition - operator.length))
        tokens.push(createToken(operator, type, currentPosition))
        currentStr = ''
      }

      if ( (currentPosition === (searchStr.length - 1)) && currentStr.length > 0) {
        // We're at the end of the search string but we have some current string left, must be a term
        tokens.push(createToken(currentStr, 'term', currentPosition))
      }

      currentPosition++
    }

    return tokens
  }
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

// Returns true when a match starts at the beginning searchStr
// EX: AND or OR or " or ' '  (with a space at the end)
function operatorMatch(matchStart) {
  return matchStart === 0
}

// Returns true when a match starts after the beginning searchStr
// EX: termAND or term) or term" or term' '  (with a space at the end)
function termAndOperatorMatch(matchStart) {
  return matchStart > 0
}

// Returns true no matter where match is found in search string
function matchFound(matchStart) {
  return matchStart !== -1
}

module.exports = Lexer
