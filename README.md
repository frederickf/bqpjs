# Boolean Query Parser JS

Transform a Boolean query string into a tokanized tree or rpn data structure.

```
let parsed = bqpjs('A AND B')
```

## Install
```
npm install bqpjs
```

Features and API may not be stable until a 1.x.x release. You may wish to use `--save-exact` to avoid installing breaking changes in the future.

## Features

### Syntax

BQPJS supports the following Boolean search syntax:

* **AND**
  * `A AND B`
  * AND is the default operator, so `A B` equals `A AND B`
* **OR**
  * `A OR B`
* **NOT**
  * `NOT B`
  * `A NOT B`
* **Quotations**
  * Must be `"`
  * `"A B" OR A OR B`
    *  `A B` is treated as a single term.
  * `"A AND B" OR A OR B`
    * `A AND B` is treated as a single term. `AND` is not evaluated as an operator.
    * Anything inside quotations will be treated as a single term
* **Parenthesis**
  * `(A OR B) AND (C OR D)`
* **Nested parenthesis**
  * `(C AND (A OR B)) NOT D`

### Order of operations
Queries will be evaluated in the following order in the absence of parenthesis:
1. NOT
2. AND
3. OR

### Alternate operator characters
The following short tokens are supported:

| Operator | Name | Character | Example |
|---|---|:---:|---|
 AND | Plus sign | `+` | `A + B`
 OR | Tilde | `~` | `A ~ B`
 NOT | Minus sign | `-` | `A + B - C`

 Operators and alternates can be mixed:
 * `A + B AND C`
 * `A AND B -D`

### Validation
Incorrectly formatted search strings will trigger an error to be thrown.

Input: ```'A OR OR C'```

Output: ```Error: Invalid token "OR" at position 5```

### White-space
White-space is ignored.
* `AANDB` is interpreted as `A AND B`
* 'A&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AND&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;B' is interpreted as `A AND B`

### Tokanized data structure results

The search string input is transformed into objects of the following structure:
```
{
  "value": String,
  "type": String,
  "operation": String,
  "position": {
    "start": Number,
    "end": Number
  },
  "left": null or Token, // tree only
  "right": null or Token // tree only
}
```
| Key | Description |
|---|---|
 `value` | A value from the input string represented by this token.
 `type` | Either `term` or `operator`
 `operation` | Identifies operator. Only present if `type` is `operator`. Will be `AND`, `OR` or `NOT`
 `position.start` | Zero indexed location of the start of the value in the input string
 `position.end` | Zero indexed location of the end of the value in the input string
 `left` | Operand token. Tree only
 `right` | Operand token. Tree only

See Example section below for data structures with actual values.

## How it works
The input string is parsed to find known patterns. These matches are then assigned type, operation, and position as appropriate to create tokens, quotations are converted to terms, white-space is removed, and the tokens are validated. Next, an implementation of Dijkstra's Shunting Yard algorithm is used to re-order the tokens in reverse polish notation with parentheses removed. Finally, an expression tree is generated with operations as nodes and terms as leafs.

## Example

See [/examples](./examples) for scripts demonstrating how to use bqpjs().

### Input
```
let parsed = bqpjs('A AND B')
```

### Output

```
{
  rpn: [{
    "value": "A",
    "type": "term",
    "position": {
      "start": 0,
      "end": 0
    }
  },
  {
    "value": "B",
    "type": "term",
    "position": {
      "start": 6,
      "end": 6
    }
  },
  {
    "value": "AND",
    "type": "operator",
    "operation": "AND",
    "position": {
      "start": 2,
      "end": 4
    }
  }],
  tree: {
    "value": "AND",
    "type": "operator",
    "operation": "AND",
    "position": {
      "start": 2,
      "end": 4
    },
    "left": {
      "value": "A",
      "type": "term",
      "position": {
        "start": 0,
        "end": 0
      },
      "left": null,
      "right": null
    },
    "right": {
      "value": "B",
      "type": "term",
      "position": {
        "start": 6,
        "end": 6
      },
      "left": null,
      "right": null
    }
  }
}
```
