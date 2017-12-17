/*
Based on https://en.wikipedia.org/wiki/Shunting-yard_algorithm
Modified for boolean terms
*/
const operators = {
  'NOT': {
    precedence: 4,
    associativity: 'right'
  },
  'AND': {
    precedence: 3,
    associativity: 'left'
  },
  'OR': {
    precedence: 2,
    associativity: 'left'
  },
  '(': {
    precedence: 0,
    associativity: 'na'
  },
  ')': {
    precedence: 0,
    associativity: 'na'
  }
}

let output = []
const operatorStack = []
const input = process.argv[2].split(' ')

for (let inputIdx = 0; inputIdx < input.length; inputIdx++) {
  let currentToken = input[inputIdx]

  console.log('currentToken', currentToken)

  if (currentToken === '(') {
    operatorStack.push('(')
  }
  else if (currentToken === ')') {
    while(operatorStack.length > 0) {
      let lastIndex = operatorStack.length - 1
      if (operatorStack[lastIndex] !== '(') {
        output.push(operatorStack.pop())
      }
      else {
        operatorStack.pop()
        break
      }
    }
  }
  else if (currentToken in operators) {
    while(operatorStack.length > 0) {
      lastIndex = operatorStack.length - 1
      let lastItemInOperatorStack = operators[operatorStack[lastIndex]]
      let currentOperator = operators[currentToken]
      //if (lastItemInOperatorStack.precedence >= currentOperator.precedence && lastItemInOperatorStack.associativity === 'left')
      // if (lastItemInOperatorStack.precedence > currentOperator.precedence)
      if (
        lastItemInOperatorStack.precedence > currentOperator.precedence ||
        (lastItemInOperatorStack.precedence === currentOperator.precedence && lastItemInOperatorStack.associativity === 'left')
      )
      {
        output.push(operatorStack.pop())
      }
      else {
        break
      }
    }
    operatorStack.push(currentToken)
  }
  else {
    output.push(currentToken)
  }

  console.log('inputIdx', inputIdx)
  console.log('operatorStack', operatorStack)
  console.log('output', output)
  console.log()
}

if (operatorStack.length) {
  output = output.concat(operatorStack.reverse())
}

console.log('final output', output)
