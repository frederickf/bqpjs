const util = require('util')
const rules = require('./rules')

let again = true
const tokens = []
class Token {
  constructor(value = '', type = '', start = 0, end = 0) {
    this.value = value
    this.type = type
    this.position = {
      start: start,
      end: end
    }
  }
}

let searchStr = '(JavaScript AND Java) OR (PHP AND Java)' // (a and b)
let searchArr = searchStr.split('')

let currentStr = ''
let currentPosition = 0

let ruleNames = ['and', 'or', 'not', 'openParen', 'closeParen', 'quote', 'space']

console.log('input:', searchStr)
while(currentPosition < searchStr.length) {
  currentStr += searchArr[currentPosition]

  //console.log('currentPosition', currentPosition)
  //console.log('currentStr', currentStr)

  for (let i = 0; i < ruleNames.length; i++) {

    let rule = rules[ruleNames[i]]
    let result = rule.test(currentStr)

    // No match, apply the next rule
    if (result === -1 ) {
      continue
    }

    // this a match at the beginning of the string
    // grab it, clear current string and break out
    if (result === 0) {
      let start = currentPosition - (currentStr.length - 1)
      let end = start + (currentStr.length - 1)
      tokens.push(new Token(currentStr, rule.type, start, end))

      currentStr = ''
      break
    }

    // We've found an operator at the end of a search term
    // termAND or term) or term" or term' '  (with a space at the end)
    // grab the term, grab the operator, clear current string and break out
    if (result > 0 ) {
      let term = currentStr.slice(0, result)
      let termStart = currentPosition - (currentStr.length - 1)
      let termEnd = termStart + (term.length - 1)
      tokens.push(new Token(term, 'term', termStart, termEnd))

      let operator = currentStr.slice(result)
      let start = currentPosition - (operator.length - 1)
      let end = start + (operator.length - 1)
      tokens.push(new Token(operator, rule.type, start, end))


      currentStr = ''
      break
    }
  }

  if ( (currentPosition === (searchStr.length - 1)) && currentStr.length > 0) {
    //console.log('end of search string')
    // We're at the end of the search string but we have some current string left, must be a term
    let term = currentStr
    let termStart = currentPosition - (currentStr.length - 1)
    let termEnd = termStart + (term.length - 1)
    tokens.push(new Token(term, 'term', termStart, termEnd))
  }

  currentPosition++
}

console.log( util.inspect(tokens, {showHidden: true, depth: null}) )

function endPosition(currentPostion, length) {
  return currentPostion + length - 1
}

function createToken() {
  return Object.assign({}, token)
}

function inspectTokens(tokens) {
  console.log( util.inspect(tokens, {showHidden: true, depth: null}) )
  tokens.forEach(function(token) {
    console.log( util.inspect(token, {showHidden: true, depth: null}) )
  })
}


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
