const bqpjs = require('../../dist/bundle.cjs.js')

it('A', () => {
  const parsed = bqpjs('A')
  expect(parsed).toMatchSnapshot()
})

it('A AND B', () => {
  const parsed = bqpjs('A AND B')
  expect(parsed).toMatchSnapshot()
})

it('A + B', () => {
  const parsed = bqpjs('A + B')
  expect(parsed).toMatchSnapshot()
})

it('A+B', () => {
  const parsed = bqpjs('A+B')
  expect(parsed).toMatchSnapshot()
})

it('AANDB', () => {
  const parsed = bqpjs('AANDB')
  expect(parsed).toMatchSnapshot()
})

it('A B', () => {
  const parsed = bqpjs('A B')
  expect(parsed).toMatchSnapshot()
})

it('"A B" AND C', () => {
  const parsed = bqpjs('"A B" AND C')
  expect(parsed).toMatchSnapshot()
})

it('"A AND B" AND C', () => {
  const parsed = bqpjs('"A AND B" AND C')
  expect(parsed).toMatchSnapshot()
})

it('A OR B', () => {
  const parsed = bqpjs('A OR B')
  expect(parsed).toMatchSnapshot()
})

it('A ~ B', () => {
  const parsed = bqpjs('A ~ B')
  expect(parsed).toMatchSnapshot()
})

it('A~B', () => {
  const parsed = bqpjs('A~B')
  expect(parsed).toMatchSnapshot()
})

it('AORB', () => {
  const parsed = bqpjs('AORB')
  expect(parsed).toMatchSnapshot()
})

it('NOT A', () => {
  const parsed = bqpjs('NOT A')
  expect(parsed).toMatchSnapshot()
})

it('- A', () => {
  const parsed = bqpjs('- A')
  expect(parsed).toMatchSnapshot()
})

it('-A', () => {
  const parsed = bqpjs('-A')
  expect(parsed).toMatchSnapshot()
})

it('B NOT A', () => {
  const parsed = bqpjs('B NOT A')
  expect(parsed).toMatchSnapshot()
})

it('A AND B OR C', () => {
  const parsed = bqpjs('A AND B OR C')
  expect(parsed).toMatchSnapshot()
})

it('A AND B OR C NOT E', () => {
  const parsed = bqpjs('A AND B OR C NOT E')
  expect(parsed).toMatchSnapshot()
})

it('A AND (B OR C)', () => {
  const parsed = bqpjs('A AND (B OR C)')
  expect(parsed).toMatchSnapshot()
})

it('A AND (B OR C) NOT D', () => {
  const parsed = bqpjs('A AND (B OR C) NOT D')
  expect(parsed).toMatchSnapshot()
})

it('A AND ((B OR C) AND E) NOT D', () => {
  const parsed = bqpjs('A AND ((B OR C) AND E) NOT D')
  expect(parsed).toMatchSnapshot()
})

test('should throw unmatched open parenthesis error 1', () => {
  expect(
    () => {bqpjs('A AND (B OR C')}
  )
  .toThrowError(new Error('Expected ) to match ( at 6'))
})

test('should throw unmatched close parenthesis error ', () => {
  expect(
    () => {bqpjs('A AND B OR C)')}
  )
  .toThrowError(new Error('Invalid token ")" at position 12'))
})

test('should throw invalid close parenthesis error ', () => {
  expect(
    () => {bqpjs('A AND )')}
  )
  .toThrowError(new Error('Invalid token ")" at position 6'))
})

test('should throw unmatched open quote error', () => {
  expect(
    () => {bqpjs('A AND "B OR C')}
  )
  .toThrowError(new Error('Unmatched quote at 6'))
})

test('should throw unmatched close quote error', () => {
  expect(
    () => {bqpjs('A AND B OR C"')}
  )
  .toThrowError(new Error('Unmatched quote at 12'))
})

test('should throw invalid token error', () => {
  expect(
    () => {bqpjs('A OR OR B')}
  )
  .toThrowError(new Error('Invalid token "OR" at position 5'))
})
