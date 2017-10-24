const Token = require('./token')
console.log('process.argv[2]: ', process.argv[2])
const input = process.argv[2]
console.log('input: ', input)

// let currentStr = ''
// let currentPosition = 0
//
// while (currentPosition < input.length) {
//   currentStr += input.charAt(currentPosition)
//   currentPosition++
// }
//
// console.log('currentStr: ', currentStr)
//
// const token = new Token(input, 'term', 1, 2)
// console.log('token: ', token)
//
// console.log('token.value:', token.value)
//
// console.log('`"` === "\"": ', `"` === "\"")

console.log('input.charCodeAt(): ', input.charCodeAt())
console.log(`'\\'.charCodeAt(): `, '\\'.charCodeAt())
console.log(`input.length: `, input.length)
console.log(`'\\'.length: `, '\\'.length)

console.log('\\ === input: ', '\\' === input)
