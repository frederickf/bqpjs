class Token {
  constructor(value = '', type = '', start = 0, end = 0) {
    this.value = value
    this.type = type
    this.position = {
      start: start,
      end: end
    }
  }
}

module.exports = Token
