const Token = require('./token')

// class ValidationRule {
//   constructor(tests, errorCb) {
//     this.tests = tests
//     this.errorCb = errorCb
//   }
//
//   test(token) {
//     let inValid = true
//     this.tests.forEach((test) => {
//       if(test(token)) {
//         inValid = false
//       }
//     })
//     if (inValid) {
//       this.errorCb(token.position.start)
//     }
//
//   }
// }

// Given a token, returns the tests necessary to determine next valid token
function getDefaultTests(token) {
  const tests = {
    'term': [Token.isBinaryOperator, Token.isUnaryOperator],
    'NOT': [Token.isTerm, Token.isOpenParen],
    'AND': [Token.isTerm, Token.isOpenParen, Token.isUnaryOperator],
    'OR': [Token.isTerm, Token.isOpenParen, Token.isUnaryOperator],
    'open': [Token.isTerm, Token.isUnaryOperator, Token.isOpenParen],
    'close': [Token.isBinaryOperator, Token.isUnaryOperator]
  }

  switch (token.type) {
    case 'grouping':
    case 'operator':
      return tests[token.operation]
    case 'term':
      return tests.term
    default:
      throw new Error('Unknown token type')
  }
}

function invalidTokenError(token) {
  throw new Error(`Invalid token "${token.value}" at position ${token.position.start}`)
}

module.exports = function (tokens) {
  const openParenPostions = []
  let tests = [Token.isTerm, Token.isOpenParen, Token.isUnaryOperator]

  if (tokens.length === 1) {
    if (Token.isTerm(tokens[0])) {
      // No need to continue validating a single term quary
      return
    }
    else {
      invalidTokenError(tokens[0])
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    let currentToken = tokens[i]
    let inValid = true

    tests.forEach((test) => {
      if(test(currentToken)) {
        inValid = false
      }
    })

    if (inValid) {
      invalidTokenError(currentToken)
    }

    if (Token.isOpenParen(currentToken)) {
      openParenPostions.push(currentToken.position.start)
    }

    if (Token.isCloseParen(currentToken)) {
      openParenPostions.pop()
    }

    // Make new default rule based on current token and existence of open parens
    tests = getDefaultTests(currentToken)

    if (openParenPostions.length > 0) {
      if (currentToken.type === 'term' || currentToken.operation === 'close')
      tests = tests.slice(0)
      tests.push(Token.isCloseParen.bind(Token))
    }
  }

  if (openParenPostions.length > 0) {
    const lastIndex = openParenPostions.length - 1
    throw new Error(`Expected ) to match ( at ${openParenPostions[lastIndex]}`)
  }
}
