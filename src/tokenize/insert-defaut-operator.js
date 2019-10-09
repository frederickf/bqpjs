import Token from '../token'
import { reduce } from '../util'

const _insertDefaultOperator = (operation) => {
  return (accum, current, idx, tokens) => {
    let currentToken = current
    let nextToken = idx + 1 === tokens.length ? {type: null} : tokens[idx + 1]

    accum.push(currentToken)
    if (
      // A B
      (currentToken.type === 'term' && nextToken.type === 'term') ||
      // (A B) C
      (currentToken.operation === 'close' && nextToken.type === 'term') ||
      // (A B) (C D)
      (currentToken.operation === 'close' && nextToken.operation === 'open') ||
      // A NOT B or (B OR C) NOT A
      ((currentToken.type === 'term' || currentToken.operation === 'close') && nextToken.operation === 'NOT')
    ) {
      // This will be a token with a value of ' ', but a type and operation of
      // an operator. There will also be scenarios in which the default token
      // will share a position with the next token. EX: (A)(B) or "A""B"
      let newToken = Token.create(
        ' ',
        'operator',
        currentToken.position.end + 1,
        operation
      )
      accum.push(newToken)
    }
    return accum
  }
}

const insertDefaultOperator = (operation) => reduce(_insertDefaultOperator(operation))

export default insertDefaultOperator
