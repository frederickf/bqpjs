/*
Based on http://www.oxfordmathcenter.com/drupal7/node/628
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

// If the incoming symbols is an operand, print it..
if (!(currentToken in operators)) {
  output.push(currentToken)
}
// If the incoming symbol is a left parenthesis, push it on the stack.
else if (currentToken === '(') {
  operatorStack.push(currentToken)
}
// If the incoming symbol is a right parenthesis:
else if (currentToken === ')') {
  //  pop and print the stack symbols until you see a left parenthesis.
  while(operatorStack.length > 0) {
    let lastIndex = operatorStack.length - 1
    if (operatorStack[lastIndex] !== '(') {
      output.push(operatorStack.pop())
    }
    else {
      // Pop the left parenthesis and discard it.
      operatorStack.pop()
      break
    }
  }
  // discard the right parenthesis (by not doing anything with currentToken)
}
// If the incoming symbol is an operator
else if (currentToken in operators) {
  lastIndex = operatorStack.length - 1
  let lastItemInOperatorStack = operators[operatorStack[lastIndex]]
  let currentOperator = operators[currentToken]
  // and the stack is empty or contains a left parenthesis on top, push the incoming operator onto the stack
  if (operatorStack.length <= 0 || operatorStack[lastIndex] === '(') {
    operatorStack.push(currentToken)
  }
  // and has either higher precedence than the operator on the top of the stack, or
  // has the same precedence as the operator on the top of the stack and is right associative
  else if (
    currentOperator.precedence > lastItemInOperatorStack.precedence ||
    (lastItemInOperatorStack.precedence === currentOperator.precedence && currentOperator.associativity === 'right')
  ) {
    // -- push it on the stack.
    operatorStack.push(currentToken)
  }
  else  {
    // and has either lower precedence than the operator on the top of the stack, or
    // has the same precedence as the operator on the top of the stack and is left associative
    // -- continue to pop the stack until this is not true. Then, push the incoming operator.
    while (
      lastItemInOperatorStack.precedence > currentOperator.precedence ||
      (lastItemInOperatorStack.precedence === currentOperator.precedence && currentOperator.associativity === 'left')
    ) {
      output.push(operatorStack.pop())
      lastIndex = operatorStack.length - 1
      if (lastIndex < 0) {
        break
      }
      let lastItemInOperatorStack = operators[operatorStack[lastIndex]]
      let currentOperator = operators[currentToken]
    }
    operatorStack.push(currentToken)
  }
}
else {
  console.log('Invalid input. How did you even do that?')
}


// At the end of the expression, pop and print all operators on the stack. (No parentheses should remain.)


  console.log('inputIdx', inputIdx)
  console.log('operatorStack', operatorStack)
  console.log('output', output)
  console.log()
}

if (operatorStack.length) {
  output = output.concat(operatorStack.reverse())
}

console.log('final output', output)
