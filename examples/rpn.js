const fs = require('fs')
const path = require('path')
const { operations, has, search } = require('./lib')
const bqpjs = require('../dist/bundle.cjs')

const rpnQuery = (rpn) => {
  return (data) => {
    const results = []
    rpn.forEach((element) => {
      if (element.type === 'term') {
        results.push(data.filter(has(element.value)))
      }
      if (element.type === 'operator') {
        if (element.operation === 'NOT') {
          results.push(operations['NOT'](data)(results.pop()))
        }
        else {
          let operation = operations[element.operation]
          results.push(operation(results.pop())(results.pop()))
        }
      }
    })
    return results[0]
  }
}

let testData
try {
  testData = JSON.parse(fs.readFileSync('test-data.json'))
}
catch(error) {
  console.log('You must use data-gen.js before running this script')
  process.exit(1)
}

const booleanQuery = process.argv[2]
if (!booleanQuery) {
  console.log(`Usage: $ node ${path.basename(__filename)} "Boolean query here"`)
  process.exit(1)
}

let parsed
try {
  parsed = bqpjs(booleanQuery)
}
catch(error) {
  console.log(error.message)
  process.exit(1)
}

const testDataSearch = search(testData)
const query = rpnQuery(parsed.rpn)
console.log(JSON.stringify(testDataSearch(query), null, 2))
