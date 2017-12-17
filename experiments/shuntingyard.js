/*
Based on https://en.wikipedia.org/wiki/Shunting-yard_algorithm
*/
const operators = {
  '^': {
    precedence: 4,
    associativity: 'right'
  },
  'x': {
    precedence: 3,
    associativity: 'left'
  },
  '/': {
    precedence: 3,
    associativity: 'left'
  },
  '-': {
    precedence: 2,
    associativity: 'left'
  },
  '+': {
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
    const currentOperator = operators[currentToken]
    while(operatorStack.length > 0) {
      lastIndex = operatorStack.length - 1
      let lastItemInOperatorStack = operators[operatorStack[lastIndex]]
      // This is what is in djikstra's paper (http://www.cs.utexas.edu/%7EEWD/MCReps/MR35.PDF, page 27/28 of the pdf)
      //if (lastItemInOperatorStack.precedence >= currentOperator.precedence)
      // This was in an older version of the wikipedia article
      //if (lastItemInOperatorStack.precedence >= currentOperator.precedence && lastItemInOperatorStack.associativity === 'left')
      // This is in the latest version of the wikipedia article (2017-12-09)
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
