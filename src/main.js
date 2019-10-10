import rules from './rules'
//import createTokenizer from './tokenizer'
import getTokenize from './tokenize'
import createRpn from './create-rpn'
import createTree from './create-tree'

const ruleNames = ['and', 'plus', 'or', 'tilde', 'not', 'minus', 'openParen', 'closeParen', 'quote', 'space']
const defaultOperation = 'AND'

const selectedRules = ruleNames.filter((name)=>name in rules).map((name)=>rules[name])
const tokenize = getTokenize(selectedRules, defaultOperation)

export default function bqpjs(searchStr) {
  let tokens = tokenize(searchStr)
  let rpn = createRpn(tokens)
  let tree = createTree(rpn)

  return {
    // tokens aren't really a part of the interface, but I'm exposing them
    // to make it easier to see what is happening
    _tokens: tokens,
    rpn: rpn,
    tree: tree
  }
}
