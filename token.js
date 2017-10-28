class Token {
  constructor(value, type, operation, start = 0, end = 0) {
    this.value = value
    this.type = type
    this.operation = operation
    this.position = {
      start: start,
      end: end
    }
  }

  static create(value, type, currentPosition, operation) {
    const startPosition = calcStart(currentPosition, value.length)
    const endPosition = calcEnd(startPosition, value.length)
    return new Token(value, type, operation, startPosition, endPosition)
  }
}

// Assumes zero based index
function calcStart(position, length) {
  return position - (length - 1)
}

// Assumes zero based index
function calcEnd(position, length) {
  return position + (length - 1)
}

module.exports = Token
