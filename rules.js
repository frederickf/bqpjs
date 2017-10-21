class Rule {
  constructor(name, type = 'operator') {
    this.name = name
    this.type = type
  }

  test(str) {
    return str.indexOf(this.name)
  }

  length() {
    return this.name.length
  }
}

module.exports = {
  and: new Rule('AND'),
  or: new Rule('OR'),
  not: new Rule('NOT'),
  openParen: new Rule('('),
  closeParen: new Rule(')'),
  quote: new Rule('"'),
  space: new Rule(' ', 'whitespace')
}
