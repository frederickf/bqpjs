import Token from '../token'

// Given a token, returns the tests necessary to determine next valid token
const getDefaultTests = (token) => {
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

const invalidTokenError = (token) => {
  throw new Error(`Invalid token "${token.value}" at position ${token.position.start}`)
}

const validate = (tokens) => {
  const openParenPostions = []
  let tests = [Token.isTerm, Token.isOpenParen, Token.isUnaryOperator]

  if (tokens.length === 1) {
    if (Token.isTerm(tokens[0])) {
      // No need to continue validating a single term quary
      return tokens
    }
    else {
      invalidTokenError(tokens[0])
    }
  }

  for (const currentToken of tokens) {
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
      if (currentToken.type === 'term' || currentToken.operation === 'close') {
        tests.push(Token.isCloseParen.bind(Token))
      }
    }
  }

  if (openParenPostions.length > 0) {
    const lastIndex = openParenPostions.length - 1
    throw new Error(`Expected ) to match ( at ${openParenPostions[lastIndex]}`)
  }

  return tokens
}

export default validate
