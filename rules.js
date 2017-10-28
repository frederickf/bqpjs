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

class EscapeableRule extends Rule {
  constructor(name, type) {
    super(name, type)
  }

  test(str) {
    let result = super.test(str)

    if (result === -1) {
      return result
    }

    if (str.charAt(result - 1) === `\\`) {
      return -1
    }

    return result
  }
}

module.exports = {
  and: new Rule('AND'),
  plus: new Rule('+'),
  or: new Rule('OR'),
  tilde: new Rule('~'),
  not: new Rule('NOT'),
  minus: new Rule('-'),
  openParen: new Rule('(', 'grouping'),
  closeParen: new Rule(')', 'grouping'),
  quote: new EscapeableRule('"', 'grouping'),
  space: new Rule(' ', 'whitespace')
}
