exports.has = (searchStr) => (element) => element.includes(searchStr)
exports.is = (searchStr) => (element) => element === searchStr

const union = (a) => (b) => [...a, ...b]
const intersection = (a) => (b) => a.filter((element) => b.includes(element))
const difference = (a) => (b) => a.filter((element) => !b.includes(element))

exports.operations = {
  'NOT': difference,
  'AND': intersection,
  'OR': union
}

exports.search = (data) => {
  return (query) => {
    return query(data)
  }
}
