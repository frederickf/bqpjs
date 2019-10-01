import Token from './token'

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

  //This is an implementation of Djikstra's Shunting Yard.
  createRpn(tokens) {
    let output = []
    const operatorStack = []

    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
      let currentToken = tokens[tokenIndex]

      if (Token.isTerm(currentToken)) {
        output.push(currentToken)
      }
      else if (Token.isOpenParen(currentToken)) {
        operatorStack.push(currentToken)
      }
      else if (Token.isCloseParen(currentToken)) {
        while(operatorStack.length > 0) {
          let lastIndex = operatorStack.length - 1
          if (Token.isOpenParen(operatorStack[lastIndex])) {
            operatorStack.pop()
            break
          }
          else {
            output.push(operatorStack.pop())
          }
        }
      }
      else if (Token.isOperator(currentToken)) {
        while(operatorStack.length > 0) {
          let lastIndex = operatorStack.length - 1
          let lastItemInOperatorStack = operators[operatorStack[lastIndex].operation]
          let currentOperator = operators[currentToken.operation]
          // This is the conditional described in djikstra's paper.
          // It works when all operators are left associative.
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
    }

    // Affix any remaining operators
    if (operatorStack.length) {
      output = output.concat(operatorStack.reverse())
    }

    return output
  }
}

export default Parser
