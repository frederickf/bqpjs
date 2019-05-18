class Node {
  constructor(data, type, left, right) {
    this.data = data
    this.type = type
    this.left = left
    this.right = right
  }
}

class ExpressionTree {
  constructor() {
    this.root = null
  }

  createFromRpn(rpn) {
    const stack = []

    for (let i = 0; i < rpn.length; i++) {
      let currentSymbol = rpn[i]
      if (currentSymbol.type === 'term') {
        stack.push(new Node(currentSymbol.value, 'term', null, null))
      }
      if (currentSymbol.type === 'operator') {
        if (currentSymbol.operation === 'NOT') {
          let right = stack.pop()
          stack.push(new Node(currentSymbol.operation, 'operator', null, right))
        }
        else {
          let right = stack.pop()
          let left = stack.pop()
          stack.push(new Node(currentSymbol.operation, 'operator', left, right))
        }
      }
    }
    if (stack.length === 1) {
      this.root = stack[0]
    }
    else {
      throw new Error('Too many nodes in stack')
    }
  }
}

module.exports = ExpressionTree
