const Lexer = require('./lexer')
const rules = require('./rules')
const validator = require('./validator')
const Parser = require('./parser')

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
