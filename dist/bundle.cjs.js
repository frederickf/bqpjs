'use strict';

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

class Lexer {

  constructor(rules, ruleNames, defaultOperation) {
    this.rules = rules;
    this.ruleNames = ruleNames;
    this.defaultOperation = defaultOperation;
  }

  createTokens(searchStr) {
    let currentStr = '';
    let currentPosition = 0;
    let tokens = [];
    let quotes = false;

    while (currentPosition < searchStr.length) {
      currentStr += searchStr.charAt(currentPosition);

      for (let i = 0; i < this.ruleNames.length; i++) {
        let rule = this.rules[this.ruleNames[i]];
        let matchStart = rule.test(currentStr);

        if (matchStart !== -1 ) {
          let nonTerm = currentStr.slice(matchStart);

          if (rule.type === 'quote') {
            quotes = true;
          }

          if (matchStart > 0 ) {
            // We've found a nonTerm at the end of a term
            // EX: termAND or term) or term" or term' '  (with a space at the end)
            let term = currentStr.slice(0, matchStart);
            tokens.push(Token.create(term, 'term', currentPosition - nonTerm.length));
          }

          tokens.push(Token.create(nonTerm, rule.type, currentPosition, rule.operation));

          currentStr = '';
        }
      }

      currentPosition++;
    }

    if (currentStr !== '') {
      // We've iterated to the end of the search string but we have some
      // unmatched string remaining, must be a term
      tokens.push(Token.create(currentStr, 'term', searchStr.length - 1));
    }

    if (quotes) {
      tokens = createTermsFromQuotes(tokens);
    }

    tokens = stripRepeatedWhiteSpace(tokens);
    if (this.defaultOperation) {
      tokens = convertWhiteSpaceToDefaultOperator(tokens, this.defaultOperation);
    }
    tokens = tokens.filter((token) => {
      return token.type !== this.rules.space.type
    });

    return tokens
  }
}

function stripRepeatedWhiteSpace(tokens) {
  const newTokens = [];
  let previousToken = {type: null};

  while(tokens.length) {
    let currentToken = tokens.shift();

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
        (previousToken.type === 'term' && nextToken.type === 'term') ||
        (previousToken.operation === 'close' && nextToken.operation === 'open') ||
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

  while(tokens.length) {
    let currentToken = tokens.shift();

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
    throw new Error(`Unclosed quote at ${lastQuoteToken.position.start}`)
  }

  return newTokens
}

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

  for (let i = 0; i < tokens.length; i++) {
    let currentToken = tokens[i];
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

class Parser {
  constructor() {

  }

  //This is an implementation of Djikstra's Shunting Yard.
  createRpn(tokens) {
    let output = [];
    const operatorStack = [];

    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
      let currentToken = tokens[tokenIndex];

      if (Token.isTerm(currentToken)) {
        output.push(currentToken);
      }
      else if (Token.isOpenParen(currentToken)) {
        operatorStack.push(currentToken);
      }
      else if (Token.isCloseParen(currentToken)) {
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
      else if (Token.isOperator(currentToken)) {
        while(operatorStack.length > 0) {
          let lastIndex = operatorStack.length - 1;
          let lastItemInOperatorStack = operators[operatorStack[lastIndex].operation];
          let currentOperator = operators[currentToken.operation];
          // This is the conditional described in djikstra's paper.
          // It works when all operators are left associative.
          if (lastItemInOperatorStack.precedence >= currentOperator.precedence) {
            output.push(operatorStack.pop());
          }
          else {
            break
          }
        }
        operatorStack.push(currentToken);
      }
      else {
        throw new Error('Unenexpected token: ', currentToken)
      }
    }

    // Affix any remaining operators
    if (operatorStack.length) {
      output = output.concat(operatorStack.reverse());
    }

    return output
  }
}

class Node {
  constructor(data, type, left, right) {
    this.data = data;
    this.type = type;
    this.left = left;
    this.right = right;
  }
}

class ExpressionTree {
  constructor() {
    this.root = null;
  }

  createFromRpn(rpn) {
    const stack = [];

    for (let i = 0; i < rpn.length; i++) {
      let currentSymbol = rpn[i];
      if (currentSymbol.type === 'term') {
        stack.push(new Node(currentSymbol.value, 'term', null, null));
      }
      if (currentSymbol.type === 'operator') {
        if (currentSymbol.operation === 'NOT') {
          let right = stack.pop();
          stack.push(new Node(currentSymbol.operation, 'operator', null, right));
        }
        else {
          let right = stack.pop();
          let left = stack.pop();
          stack.push(new Node(currentSymbol.operation, 'operator', left, right));
        }
      }
    }
    if (stack.length === 1) {
      this.root = stack[0];
    }
    else {
      throw new Error('Too many nodes in stack')
    }
  }
}

const ruleNames = ['and', 'plus', 'or', 'tilde', 'not', 'minus', 'openParen', 'closeParen', 'quote', 'space'];
const defaultOperation = 'AND';

const lexer = new Lexer(rules, ruleNames, defaultOperation);
const parser = new Parser();
const expressionTree = new ExpressionTree();

function main (searchStr) {
  const tokens = lexer.createTokens(searchStr);
  try {
    validator(tokens);
  }
  catch(error) {
    throw new Error(`Validation Error: ${error.message}`)
  }

  const rpn = parser.createRpn(tokens);

  try {
    expressionTree.createFromRpn(rpn);
  }
  catch(error) {
    throw new Error(`ExpresionTree Error: ${error}`)
  }

  return {
    // tokens aren't really a part of the interface, but I'm exposing them
    // to make it easier to see what is happening
    _tokens: tokens,
    rpn: rpn,
    tree: expressionTree.root
  }
}

module.exports = main;
