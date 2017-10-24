
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
    const searchArr = searchStr.split('')
    const tokens = []

    while (currentPosition < searchArr.length) {
      currentStr += searchArr[currentPosition]


      if (quoteMode) {
        // Accumulate currentStr until we find closing quote
        let matchStart = this.rules[`quote`].test(currentStr)
        if (matchStart > 0) {
          let operator = currentStr.slice(matchStart)
          let term = currentStr.slice(0, matchStart)
          tokens.push(createToken(term, 'term', currentPosition - operator.length))
          tokens.push(createToken(operator, this.rules[`quote`].type, currentPosition))
          currentStr = ''
          quoteMode = false
        }
      }
      else {
        for (let i = 0; i < this.ruleNames.length; i++) {
          let rule = this.rules[this.ruleNames[i]]
          let matchStart = rule.test(currentStr)

          if (matchStart !== -1 ) {
            let operator = currentStr.slice(matchStart)

            if (this.ruleNames[i] === `quote`) {
              quoteMode = true
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
      }

      if ( (currentPosition === (searchArr.length - 1)) && currentStr.length > 0) {
        // We're at the end of the search string but we have some current string left, must be a term
        tokens.push(createToken(currentStr, 'term', currentPosition))
      }

      currentPosition++
    }

    // console.log(tokens)

    // Fix quotes
    // const quoteIndexes = []
    // for (let i = 0; i < tokens.length; i++) {
    //   if (tokens[i].value === `"`) {
    //     quoteIndexes.push(i)
    //   }
    // }
    //
    // console.log('quoteIndexes: ', quoteIndexes)
    //
    // if (quoteIndexes.length) {
    //   if (quoteIndexes.length % 2) {
    //     const token = tokens[quoteIndexes[quoteIndexes.length - 1]]
    //     throw new Error(`Unclosed quote at ${token.position.start}`)
    //   }
    //
    //   // Iterate threw quotedIdexes 2 at a time
    //   for (let i = 0; i < quoteIndexes.length; i+=2) {
    //     let IndexAfteropenQuote = quoteIndexes[i] + 1
    //     let closeQuoteIndex = quoteIndexes[i + 1]
    //     let quotedTerm = ''
    //     for (let k = IndexAfterOpenQuote; k < closeQuoteIndex; k++) {
    //       quotedTerm += tokens[k].value
    //     }
    //     let positionPriorToCloseQuote = tokens[closeQuoteIndex].position.end - 1
    //     let quotedToken = createToken(quotedTerm, 'term', positionPriorToCloseQuote)
    //     let deleteCnt = closeQuoteIndex - openQuoteIndex
    //     // Start after open ", and delete upto, but not including close "
    //     // TODO - more than one loop breaks because tokens.length changes here
    //     // probably need recursion, passing in new tokens each time
    //     tokens.splice(openQuoteIndex + 1, deleteCnt - 1, quotedToken)
    //   }
    // }

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

module.exports = Lexer
