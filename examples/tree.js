const fs = require('fs')
const path = require('path')
const { operations, has, search } = require('./lib')
const bqp = require('../dist/bundle.cjs')

const treeQuery = (node) => {
  return (data) => {
    function postOrder(node) {
      if (node !== null) {
        const left = postOrder(node.left)
        const right = postOrder(node.right)
        if (node.type === 'term') {
          return data.filter(has(node.data))
        }
        if (node.type === 'operator') {
          if (node.data === 'NOT') {
            return operations['NOT'](data)(left || right)
          }
          else {
            let operation = operations[node.data]
            return operation(left)(right)
          }
        }
      }
    }
    return postOrder(node)
  }
}

let testData
try {
  testData = JSON.parse(fs.readFileSync('test-data.json'))
}
catch(error) {
  console.log('You must use ./data-gen.js before running this script')
  process.exit(1)
}

const booleanQuery = process.argv[2]
if (!booleanQuery) {
  console.log(`Usage: $ node ${path.basename(__filename)} "Boolean query here"`)
  process.exit(1)
}

let parsed
try {
  parsed = bqp(booleanQuery)
}
catch(error) {
  console.log(error.message)
  process.exit(1)
}

const testDataSearch = search(testData)
const query = treeQuery(parsed.tree)
console.log(JSON.stringify(testDataSearch(query), null, 2))
