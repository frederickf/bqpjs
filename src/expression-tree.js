const node = (obj, left = null, right = null) => {
  return Object.assign({}, obj, {left, right})
}

const rpnToTree = (acc, symbol) => {
  if (symbol.type === 'term') {
    acc.push(node(symbol))
  }
  if (symbol.type === 'operator') {
    if (symbol.operation === 'NOT') {
      let right = acc.pop()
      acc.push(node(symbol, null, right))
    }
    else {
      let right = acc.pop()
      let left = acc.pop()
      acc.push(node(symbol, left, right))
    }
  }
  return acc
}

const createExpressionTree = (rpn) => {
  const tree = rpn.reduce(rpnToTree, []).shift()
  if (tree) {
    return tree
  }
  else {
    throw new Error('Unable to create expression tree. Too many symbols')
  }
}

export default createExpressionTree
