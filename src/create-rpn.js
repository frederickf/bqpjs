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
};

const createRpn = (tokens) => {
  let output = []
  const operatorStack = []

  for (const token of tokens) {
    if (Token.isTerm(token)) {
      output.push(token)
    }
    else if (Token.isOpenParen(token)) {
      operatorStack.push(token)
    }
    else if (Token.isCloseParen(token)) {
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
    else if (Token.isOperator(token)) {
      while(operatorStack.length > 0) {
        let lastIndex = operatorStack.length - 1
        let lastItemInOperatorStack = operators[operatorStack[lastIndex].operation]
        let currentOperator = operators[token.operation]
        // This is the conditional described in djikstra's paper.
        // It works when all operators are left associative.
        if (lastItemInOperatorStack.precedence >= currentOperator.precedence) {
          output.push(operatorStack.pop())
        }
        else {
          break
        }
      }
      operatorStack.push(token)
    }
    else {
      throw new Error('Unenexpected token: ', token)
    }
  }

  // Affix any remaining operators
  if (operatorStack.length) {
    output = output.concat(operatorStack.reverse())
  }

  return output
}

export default createRpn
