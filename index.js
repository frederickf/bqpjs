const Lexer = require('./src/lexer')
const rules = require('./src/rules')
const validator = require('./src/validator')
const Parser = require('./src/parser')
const ExpressionTree = require('./src/expression-tree')

let searchStr = process.argv[2]

const ruleNames = ['and', 'plus', 'or', 'tilde', 'not', 'minus', 'openParen', 'closeParen', 'quote', 'space']

const lexer = new Lexer(rules, ruleNames, 'AND')
const tokens = lexer.createTokens(searchStr)
//console.log('tokens: ', JSON.stringify(tokens), '\n')

try {
  validator(tokens)
}
catch(error) {
  console.log(`Validation Error: ${error.message}`)
}

const parser = new Parser()
const syntax = parser.createRpn(tokens)
console.log('RPN: ', JSON.stringify(syntax, null, 2))

const expressionTree = new ExpressionTree()
try {
  expressionTree.createFromRpn(syntax)
}
catch(error) {
  console.log(`ExpresionTree Error: ${error}`)
}
console.log('Tree: ', JSON.stringify(expressionTree.root, null, 4))
