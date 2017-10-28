const util = require('util')
const Lexer = require('./lexer')
const rules = require('./rules')
const Parser = require('./parser')

let searchStr = process.argv[2]

const ruleNames = ['and', 'plus', 'or', 'tilde', 'not', 'minus', 'openParen', 'closeParen', 'quote', 'space']

const lexer = new Lexer(rules, ruleNames)
const tokens = lexer.createTokens(searchStr)

const parser = new Parser()
const syntax = parser.createAbstractSyntaxTree(tokens)

console.log('tokens', tokens)
console.log()
console.log('syntax', syntax)


// No quetes inside quetes?
// jd"kd\"dlkjfs\"lksjf"jlkjlk
//

/*

Pass one
iterate through characters buidling array of objects that represent meaningful tokens, in the same order they appear in the string

token types
 search term - Anything not an operator or anything between parenthesis
 operator - AND, OR, NOT, +, -, (, ), ", ", ' '


* Find parenthenticals
iterate through entire string looking for parentheticals
if any are found, treat them like individual expression that are given priority parsing
This would need to be a recursive process, to account for parentheticals inside of parentheticals

* Process expression
Go character by character
apply rule to character. if a match is found, add it terms
if no match is found, create longer string by appending next character
apply rules to new string. if a match is found, add string to terms
repeat
if character is a ", assume everything that follows is a search term until closing quote is found


*/
