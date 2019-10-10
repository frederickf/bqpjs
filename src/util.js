import compose from 'compose-function'

export { compose }

export const composeLeft = (...args) => compose(...args.reverse())

export const isNot = (type) => {
  return token => token.type !== type
}

export const filter = (fn) => {
  return (array) => array.filter(fn)
}

export const reduce = (fn) => {
  return (array) => array.reduce(fn, [])
}

export const flatMap = (fn) => {
  return (array) => array.flatMap(fn)
}

export const pluck = (idx) => {
  return (array) => array[idx]
}
