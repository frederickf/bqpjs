const fs = require('fs')

const createTestData = (data, stopCondition = 0) => {
  if (stopCondition === 0) {
    return [...data]
  }
  const newData = [
    ...data.flatMap(item => letters.map(letter => `${item}${letter}`))
  ]
  return [...data, ...createTestData(newData, stopCondition - 1)]
}

const letters = ['A', 'B', 'C', 'D']
const testData = createTestData(letters, letters.length - 1)
fs.writeFileSync('./test-data.json', JSON.stringify(testData, null, 2), 'utf8')
