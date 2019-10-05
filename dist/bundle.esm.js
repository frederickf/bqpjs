class Rule {
  constructor(pattern, operation, type = 'operator') {
    this.pattern = pattern;
    this.operation = operation;
    this.type = type;
  }

  test(str) {
    return str.search(this.pattern)
  }
}

class EscapeableRule extends Rule {
  constructor(name, operation, type) {
    super(name, operation, type);
  }

  test(str) {
    let result = super.test(str);

    if (result === -1) {
      return result
    }

    if (str.charAt(result - 1) === `\\`) {
      return -1
    }

    return result
  }
}

var rules = {
  and: new Rule(/AND/g, 'AND'),
  plus: new Rule(/\+/g, 'AND'),
  or: new Rule(/OR/g, 'OR'),
  tilde: new Rule(/~/g, 'OR'),
  not: new Rule(/NOT/g, 'NOT'),
  minus: new Rule(/-/g, 'NOT'),
  openParen: new Rule(/\(/g, 'open', 'grouping'),
  closeParen: new Rule(/\)/g, 'close','grouping'),
  quote: new EscapeableRule(/"/g, undefined, 'quote'),
  space: new Rule(/\s/g, undefined, 'whitespace')
};

class Token {
  constructor(value, type, operation, start = 0, end = 0) {
    this.value = value;
    this.type = type;
    this.operation = operation;
    this.position = {
      start: start,
      end: end
    };
  }

  static isTerm(token) {
    return (token.type === 'term')
  }

  static isOpenParen(token) {
    return (token.type === 'grouping' && token.operation === 'open')
  }

  static isCloseParen(token) {
    return (token.type === 'grouping' && token.operation === 'close')
  }

  static isOperator(token) {
    return (token.type === 'operator')
  }

  static isBinaryOperator(token) {
    return (Token.isOperator(token) && (token.operation === 'AND' || token.operation === 'OR'))
  }

  static isUnaryOperator(token) {
    return (Token.isOperator(token) && token.operation === 'NOT')
  }

  static create(value, type, currentPosition, operation) {
    const startPosition = calcStart(currentPosition, value.length);
    const endPosition = calcEnd(startPosition, value.length);
    return new Token(value, type, operation, startPosition, endPosition)
  }
}

// Assumes zero based index
function calcStart(position, length) {
  return position - (length - 1)
}

// Assumes zero based index
function calcEnd(position, length) {
  return position + (length - 1)
}

// Given a token, returns the tests necessary to determine next valid token
function getDefaultTests(token) {
  const tests = {
    'term': [Token.isBinaryOperator, Token.isUnaryOperator],
    'NOT': [Token.isTerm, Token.isOpenParen],
    'AND': [Token.isTerm, Token.isOpenParen, Token.isUnaryOperator],
    'OR': [Token.isTerm, Token.isOpenParen, Token.isUnaryOperator],
    'open': [Token.isTerm, Token.isUnaryOperator, Token.isOpenParen],
    'close': [Token.isBinaryOperator, Token.isUnaryOperator]
  };

  switch (token.type) {
    case 'grouping':
    case 'operator':
      return tests[token.operation]
    case 'term':
      return tests.term
    default:
      throw new Error('Unknown token type')
  }
}

function invalidTokenError(token) {
  throw new Error(`Invalid token "${token.value}" at position ${token.position.start}`)
}

function validator(tokens) {
  const openParenPostions = [];
  let tests = [Token.isTerm, Token.isOpenParen, Token.isUnaryOperator];

  if (tokens.length === 1) {
    if (Token.isTerm(tokens[0])) {
      // No need to continue validating a single term quary
      return
    }
    else {
      invalidTokenError(tokens[0]);
    }
  }

  for (const currentToken of tokens) {
    let inValid = true;

    tests.forEach((test) => {
      if(test(currentToken)) {
        inValid = false;
      }
    });

    if (inValid) {
      invalidTokenError(currentToken);
    }

    if (Token.isOpenParen(currentToken)) {
      openParenPostions.push(currentToken.position.start);
    }

    if (Token.isCloseParen(currentToken)) {
      openParenPostions.pop();
    }

    // Make new default rule based on current token and existence of open parens
    tests = getDefaultTests(currentToken);

    if (openParenPostions.length > 0) {
      if (currentToken.type === 'term' || currentToken.operation === 'close')
      tests = tests.slice(0);
      tests.push(Token.isCloseParen.bind(Token));
    }
  }

  if (openParenPostions.length > 0) {
    const lastIndex = openParenPostions.length - 1;
    throw new Error(`Expected ) to match ( at ${openParenPostions[lastIndex]}`)
  }

  return tokens
}

function createTokenizer(userRules, defaultOperation) {
  return function tokenize(searchStr) {
    let matches = findMatches(searchStr, userRules);

    let tokens = matches.flatMap(matchToTokens);

    // This must be done before whitespace is stripped because quotes can
    // contain whitespace which needs to be preserved as part of a term
    if (!!tokens.find(token => token.type === rules.quote.type)) {
      tokens = createTermsFromQuotes(tokens);
    }

    tokens = stripRepeatedWhiteSpace(tokens);

    if (defaultOperation) {
      tokens = convertWhiteSpaceToDefaultOperator(tokens, defaultOperation);
    }

    tokens = tokens.filter(isNot(rules.space.type));

    tokens = validator(tokens);

    return tokens
  }
}

function findMatches(searchStr, rules) {
  // We can't make tokens yet because not all matches will be exactly a token
  // For example, termAND will match the AND test
  let matches = [];
  let subStr = '';

  for (let currentIdx = 0; currentIdx < searchStr.length; currentIdx++) {
    subStr += searchStr.charAt(currentIdx);

    for (const rule of rules) {
      let matchStart = rule.test(subStr);
      if (matchStart !== -1 ) {
        matches.push({
          subStr,
          currentIdx,
          matchStart,
          type: rule.type,
          operation: rule.operation
        });
        subStr = '';
        break
      }
    }
  }

  if (subStr !== '') {
    // We've iterated to the end of the search string but we have some
    // unmatched string remaining, which can only be a term
    matches.push({
      subStr,
      currentIdx: searchStr.length - 1,
      matchStart: -1,
      type: 'term',
      operation: undefined
    });
  }

  return matches
}

function matchToTokens(match) {
  let tokens = [];
  const { subStr, matchStart, currentIdx, type, operation} = match;

  if (matchStart >= 0) {
    let nonTerm = subStr.slice(matchStart);
    if (matchStart > 0 ) {
      // We've found a match prefixed with a term
      // EX: termAND or term) or term" or term' '  (with a space at the end)
      let term = subStr.slice(0, matchStart);
      tokens.push(Token.create(term, 'term', currentIdx - nonTerm.length));
    }
    tokens.push(Token.create(nonTerm, type, currentIdx, operation));
  }
  else {
    // Anything not a match must be a term
    tokens.push(Token.create(subStr, 'term', currentIdx - 1));
  }

  return tokens
}

function stripRepeatedWhiteSpace(tokens) {
  const newTokens = [];
  let previousToken = {type: null};

  for (const currentToken of tokens) {
    if (currentToken.type === 'whitespace') {
      if (previousToken.type !== 'whitespace') {
        newTokens.push(currentToken);
      }
    }
    else {
      newTokens.push(currentToken);
    }
    previousToken = currentToken;
  }

  return newTokens
}

function convertWhiteSpaceToDefaultOperator(tokens, defaultOperation) {
  for (let i = 0; i < tokens.length; i++) {
    let previousToken = i === 0 ? {type: null} : tokens[i - 1];
    let currentToken = tokens[i];
    let nextToken = i + 1 === tokens.length ? {type: null} : tokens[i + 1];

    if (currentToken.type === 'whitespace') {
      if (
        // A B
        (previousToken.type === 'term' && nextToken.type === 'term') ||
        // (A B) C
        (previousToken.operation === 'close' && nextToken.type === 'term') ||
        // (A B) (C D)
        (previousToken.operation === 'close' && nextToken.operation === 'open') ||
        // A NOT B or (B OR C) NOT A
        (nextToken.operation === 'NOT' && (previousToken.type === 'term' || previousToken.operation === 'close'))
      ) {
        // This will be a token with a value of ' ', but a type and operation of an operator
        let newToken = Token.create(
          currentToken.value,
          'operator',
          currentToken.position.end,
          defaultOperation
        );
        tokens.splice(i, 1, newToken);
      }
    }
  }

  return tokens
}

function createTermsFromQuotes(tokens) {
  const newTokens = [];
  let quoteMode = false;
  let currentValue = '';
  let lastQuoteToken = null;

  for (const currentToken of tokens) {
    if (quoteMode) {
      if (currentToken.type === `quote`) {
        newTokens.push(Token.create(currentValue, 'term', currentToken.position.end - 1));
        currentValue = '';
        quoteMode = false;
      }
      else {
        currentValue += currentToken.value;
      }
    }
    else {
      if (currentToken.type === `quote`) {
        lastQuoteToken = currentToken;
        quoteMode = true;
      }
      else {
        newTokens.push(currentToken);
      }
    }
  }

  if (quoteMode) {
    throw new Error(`Unmatched quote at ${lastQuoteToken.position.start}`)
  }

  return newTokens
}

function isNot(type) {
  return token => token.type !== type
}

const operators = {
  'NOT': {
    precedence: 3
  },
  'AND': {
    precedence: 2
  },
  'OR': {
    precedence: 1
  },
  'open': {
    precedence: 0
  }
};

const createRpn = (tokens) => {
  let output = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (Token.isTerm(token)) {
      output.push(token);
    }
    else if (Token.isOpenParen(token)) {
      operatorStack.push(token);
    }
    else if (Token.isCloseParen(token)) {
      while(operatorStack.length > 0) {
        let lastIndex = operatorStack.length - 1;
        if (Token.isOpenParen(operatorStack[lastIndex])) {
          operatorStack.pop();
          break
        }
        else {
          output.push(operatorStack.pop());
        }
      }
    }
    else if (Token.isOperator(token)) {
      while(operatorStack.length > 0) {
        let lastIndex = operatorStack.length - 1;
        let lastItemInOperatorStack = operators[operatorStack[lastIndex].operation];
        let currentOperator = operators[token.operation];
        // This is the conditional described in djikstra's paper.
        // It works when all operators are left associative.
        if (lastItemInOperatorStack.precedence >= currentOperator.precedence) {
          output.push(operatorStack.pop());
        }
        else {
          break
        }
      }
      operatorStack.push(token);
    }
    else {
      throw new Error('Unenexpected token: ', token)
    }
  }

  // Affix any remaining operators
  if (operatorStack.length) {
    output = output.concat(operatorStack.reverse());
  }

  return output
};

const node = (obj, left = null, right = null) => {
  return Object.assign({}, obj, {left, right})
};

const rpnToTree = (acc, symbol) => {
  if (symbol.type === 'term') {
    acc.push(node(symbol));
  }
  if (symbol.type === 'operator') {
    if (symbol.operation === 'NOT') {
      let right = acc.pop();
      acc.push(node(symbol, null, right));
    }
    else {
      let right = acc.pop();
      let left = acc.pop();
      acc.push(node(symbol, left, right));
    }
  }
  return acc
};

const createExpressionTree = (rpn) => {
  const tree = rpn.reduce(rpnToTree, []).shift();
  if (tree) {
    return tree
  }
  else {
    throw new Error('Unable to create expression tree. Too many symbols')
  }
};

const ruleNames = ['and', 'plus', 'or', 'tilde', 'not', 'minus', 'openParen', 'closeParen', 'quote', 'space'];
const defaultOperation = 'AND';

const selectedRules = ruleNames.filter((name)=>name in rules).map((name)=>rules[name]);
const tokenize = createTokenizer(selectedRules, defaultOperation);

function bqpjs(searchStr) {
  let tokens = tokenize(searchStr);
  let rpn = createRpn(tokens);
  let expressionTree = createExpressionTree(rpn);

  return {
    // tokens aren't really a part of the interface, but I'm exposing them
    // to make it easier to see what is happening
    _tokens: tokens,
    rpn: rpn,
    tree: expressionTree
  }
}

export default bqpjs;
