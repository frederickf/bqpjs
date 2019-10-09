import { filter, isNot } from '../util'

const removeToken = (type) => filter(isNot(type))

export default removeToken
