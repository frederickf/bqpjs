const path = require('path')
const bqpjs = require('../dist/bundle.cjs')

const searchStr = process.argv[2]
if (!searchStr) {
  console.log(`Usage: $ node ${path.basename(__filename)} "Boolean query here"`)
  process.exit(1)
}

let results
try {
  results = bqpjs(searchStr)
}
catch(error) {
  console.log(error)
  process.exit(1)
}

console.log('Tokens: ', JSON.stringify(results._tokens, null, 2), '\n')
console.log('RPN: ', JSON.stringify(results.rpn, null, 2), '\n')
console.log('Tree: ', JSON.stringify(results.tree, null, 2), '\n')
