const findMatches = (rules) => {
  return (searchStr) => {
    // We can't make tokens yet because not all matches will be exactly a token
    // For example, termAND will match the AND test
    let matches = []
    let subStr = ''

    for (let currentIdx = 0; currentIdx < searchStr.length; currentIdx++) {
      subStr += searchStr.charAt(currentIdx)

      for (const rule of rules) {
        let matchStart = rule.test(subStr)
        if (matchStart !== -1 ) {
          matches.push({
            subStr,
            currentIdx,
            matchStart,
            type: rule.type,
            operation: rule.operation
          })
          subStr = ''
          break
        }
      }
    }

    if (subStr !== '') {
      // We've iterated to the end of the search string but we have some
      // unmatched string remaining, which can only be a term
      matches.push({
        subStr,
        currentIdx: searchStr.length,
        matchStart: -1,
        type: 'term',
        operation: undefined
      })
    }

    return matches
  }
}

export default findMatches
