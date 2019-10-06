import Token from './token'
import rules from './rules'
import validator from './validator'

export default function createTokenizer(userRules, defaultOperation) {
  return function tokenize(searchStr) {
    let matches = findMatches(searchStr, userRules)

    let tokens = matches.flatMap(matchToTokens)

    // This must be done before whitespace is stripped because quotes can
    // contain whitespace which needs to be preserved as part of a term
    if (!!tokens.find(token => token.type === rules.quote.type)) {
      tokens = createTermsFromQuotes(tokens)
    }

    tokens = stripRepeatedWhiteSpace(tokens)

    if (defaultOperation) {
      tokens = convertWhiteSpaceToDefaultOperator(tokens, defaultOperation)
    }

    tokens = tokens.filter(isNot(rules.space.type))

    tokens = validator(tokens)

    return tokens
  }
}

function findMatches(searchStr, rules) {
  // We can't make tokens yet because not all matches will be exactly a token
  // For example, termAND will match the AND test
  let matches = []
  let subStr = ''

  for (let currentIdx = 0; currentIdx < searchStr.length; currentIdx++) {
    subStr += searchStr.charAt(currentIdx)

    for (const rule of rules) {
      let matchStart = rule.test(subStr)
      if (matchStart !== -1 ) {
        matches.push({
          subStr,
          currentIdx,
          matchStart,
          type: rule.type,
          operation: rule.operation
        })
        subStr = ''
        break
      }
    }
  }

  if (subStr !== '') {
    // We've iterated to the end of the search string but we have some
    // unmatched string remaining, which can only be a term
    matches.push({
      subStr,
      currentIdx: searchStr.length,
      matchStart: -1,
      type: 'term',
      operation: undefined
    })
  }

  return matches
}

function matchToTokens(match) {
  let tokens = []
  const { subStr, matchStart, currentIdx, type, operation} = match

  if (matchStart >= 0) {
    let nonTerm = subStr.slice(matchStart)
    if (matchStart > 0 ) {
      // We've found a match prefixed with a term
      // EX: termAND or term) or term" or term' '  (with a space at the end)
      let term = subStr.slice(0, matchStart)
      tokens.push(Token.create(term, 'term', currentIdx - nonTerm.length))
    }
    tokens.push(Token.create(nonTerm, type, currentIdx, operation))
  }
  else {
    // Anything not a match must be a term
    tokens.push(Token.create(subStr, 'term', currentIdx - 1))
  }

  return tokens
}

function stripRepeatedWhiteSpace(tokens) {
  const newTokens = []
  let previousToken = {type: null}

  for (const currentToken of tokens) {
    if (currentToken.type === 'whitespace') {
      if (previousToken.type !== 'whitespace') {
        newTokens.push(currentToken)
      }
    }
    else {
      newTokens.push(currentToken)
    }
    previousToken = currentToken
  }

  return newTokens
}

function convertWhiteSpaceToDefaultOperator(tokens, defaultOperation) {
  for (let i = 0; i < tokens.length; i++) {
    let previousToken = i === 0 ? {type: null} : tokens[i - 1]
    let currentToken = tokens[i]
    let nextToken = i + 1 === tokens.length ? {type: null} : tokens[i + 1]

    if (currentToken.type === 'whitespace') {
      if (
        // A B
        (previousToken.type === 'term' && nextToken.type === 'term') ||
        // (A B) C
        (previousToken.operation === 'close' && nextToken.type === 'term') ||
        // (A B) (C D)
        (previousToken.operation === 'close' && nextToken.operation === 'open') ||
        // A NOT B or (B OR C) NOT A
        (nextToken.operation === 'NOT' && (previousToken.type === 'term' || previousToken.operation === 'close'))
      ) {
        // This will be a token with a value of ' ', but a type and operation of an operator
        let newToken = Token.create(
          currentToken.value,
          'operator',
          currentToken.position.end,
          defaultOperation
        )
        tokens.splice(i, 1, newToken)
      }
    }
  }

  return tokens
}

function createTermsFromQuotes(tokens) {
  const newTokens = []
  let quoteMode = false
  let currentValue = ''
  let lastQuoteToken = null

  for (const currentToken of tokens) {
    if (quoteMode) {
      if (currentToken.type === `quote`) {
        newTokens.push(Token.create(currentValue, 'term', currentToken.position.end - 1))
        currentValue = ''
        quoteMode = false
      }
      else {
        currentValue += currentToken.value
      }
    }
    else {
      if (currentToken.type === `quote`) {
        lastQuoteToken = currentToken
        quoteMode = true
      }
      else {
        newTokens.push(currentToken)
      }
    }
  }

  if (quoteMode) {
    throw new Error(`Unmatched quote at ${lastQuoteToken.position.start}`)
  }

  return newTokens
}

function isNot(type) {
  return token => token.type !== type
}
