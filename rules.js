class Rule {
  constructor(pattern, operation, type = 'operator') {
    this.pattern = pattern
    this.operation = operation
    this.type = type
  }

  test(str) {
    return str.search(this.pattern)
  }

}

class EscapeableRule extends Rule {
  constructor(name, operation, type) {
    super(name, operation, type)
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
  and: new Rule(/AND/g, 'AND'),
  plus: new Rule(/\+/g, 'AND'),
  or: new Rule(/OR/g, 'OR'),
  tilde: new Rule(/~/g, 'OR'),
  not: new Rule(/NOT/g, 'NOT'),
  minus: new Rule(/-/g, 'NOT'),
  openParen: new Rule(/\(/g, 'open', 'grouping'),
  closeParen: new Rule(/\)/g, 'close','grouping'),
  quote: new EscapeableRule(/"/g, undefined, 'quote'),
  space: new Rule(/\s/g, undefined, 'whitespace')
}
