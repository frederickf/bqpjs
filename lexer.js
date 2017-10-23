
const Token = require('./token')

class Lexer {

  constructor(rules, ruleNames) {
    this.rules = rules
    this.ruleNames = ruleNames
    this.tokens = []
  }

  createTokens(searchStr) {
    let currentStr = ''
    let currentPosition = 0
    let searchArr = searchStr.split('')

    while(currentPosition < searchArr.length) {
      currentStr += searchArr[currentPosition]

      for (let i = 0; i < this.ruleNames.length; i++) {
        let rule = this.rules[this.ruleNames[i]]
        let matchStart = rule.test(currentStr)

        // No match, apply the next rule
        if (matchStart === -1 ) {
          continue
        }

        // this a match at the beginning of the string
        // grab it, clear current string and break out
        if (matchStart === 0) {
          this.tokens.push(createToken(currentStr, rule.type, currentPosition))

          currentStr = ''
          break
        }

        // We've found an operator at the end of a search term
        // termAND or term) or term" or term' '  (with a space at the end)
        // grab the term, grab the operator, clear current string and break out
        if (matchStart > 0 ) {
          let term = currentStr.slice(0, matchStart)
          let operator = currentStr.slice(matchStart)
          this.tokens.push(createToken(term, 'term', currentPosition - operator.length))
          this.tokens.push(createToken(operator, rule.type, currentPosition))

          currentStr = ''
          break
        }
      }

      if ( (currentPosition === (searchArr.length - 1)) && currentStr.length > 0) {
        //console.log('end of search string')
        // We're at the end of the search string but we have some current string left, must be a term
        this.tokens.push(createToken(currentStr, 'term', currentPosition))
      }

      currentPosition++
    }

    return this.tokens
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

module.exports = Lexer
