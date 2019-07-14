const bqp = require('./dist/bundle.cjs')

let searchStr = process.argv[2]

let results
try {
  results = bqp(searchStr)
}
catch(error) {
  console.log(error.message)
}

console.log('Tokens: ', JSON.stringify(results.tokens), '\n')
console.log('RPN: ', JSON.stringify(results.rpn, null, 2))
console.log('Tree: ', JSON.stringify(results.tree, null, 4))
