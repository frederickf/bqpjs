import Lexer from './lexer'
import rules from './rules'
import validator from './validator'
import Parser from './parser'
import ExpressionTree from './expression-tree'

const ruleNames = ['and', 'plus', 'or', 'tilde', 'not', 'minus', 'openParen', 'closeParen', 'quote', 'space']
const defaultOperation = 'AND'

const lexer = new Lexer(rules, ruleNames, defaultOperation)
const parser = new Parser()
const expressionTree = new ExpressionTree()

export default function (searchStr) {
  const tokens = lexer.createTokens(searchStr)
  try {
    validator(tokens)
  }
  catch(error) {
    throw new Error(`Validation Error: ${error.message}`)
  }

  const rpn = parser.createRpn(tokens)

  try {
    expressionTree.createFromRpn(rpn)
  }
  catch(error) {
    throw new Error(`ExpresionTree Error: ${error}`)
  }

  return {
    // tokens aren't really a part of the interface, but I'm exposing them
    // to make it easier to see what is happening
    _tokens: tokens,
    rpn: rpn,
    tree: expressionTree.root
  }
}
