const operators = {
  'NOT': {
    precedence: 3
  },
  'AND': {
    precedence: 2
  },
  'OR': {
    precedence: 1
  },
  'open': {
    precedence: 0
  }
}

class Parser {
  constructor() {

  }

  createRpn(tokens) {
    let output = []
    const operatorStack = []

    for (let tokenIdx = 0; tokenIdx < tokens.length; tokenIdx++) {
      let currentToken = tokens[tokenIdx]

      //console.log('currentToken', currentToken)

      if (isTerm(currentToken)) {
        output.push(currentToken)
      }
      else if (isOpenParen(currentToken)) {
        operatorStack.push(currentToken)
      }
      else if (isCloseParen(currentToken)) {
        while(operatorStack.length > 0) {
          let lastIndex = operatorStack.length - 1
          if (isOpenParen(operatorStack[lastIndex])) {
            operatorStack.pop()
            break
          }
          else {
            output.push(operatorStack.pop())
          }
        }
      }
      else if (isOperator(currentToken)) {
        while(operatorStack.length > 0) {
          let lastIndex = operatorStack.length - 1
          let lastItemInOperatorStack = operators[operatorStack[lastIndex].operation]
          let currentOperator = operators[currentToken.operation]
          // This is the conditional described in djikstra's paper. It works when all operators are left associative.
          if (lastItemInOperatorStack.precedence >= currentOperator.precedence) {
            output.push(operatorStack.pop())
          }
          else {
            break
          }
        }
        operatorStack.push(currentToken)
      }
      else {
        throw new Error('Unenexpected token: ', currentToken)
      }

      //console.log('tokenIdx', tokenIdx)
      //console.log('operatorStack', operatorStack)
      //console.log('output', output)
      //console.log()
    }

    // Affix any remaining operators
    if (operatorStack.length) {
      output = output.concat(operatorStack.reverse())
    }

    //console.log('final output', output)

    return output
  }

}

function isTerm(token) {
  return (token.type === 'term')
}

function isOpenParen(token) {
  return (token.type === 'grouping' && token.operation === 'open')
}

function isCloseParen(token) {
  return (token.type === 'grouping' && token.operation === 'close')
}

function isOperator(token) {
  return (token.operation in operators)
}


module.exports = Parser
