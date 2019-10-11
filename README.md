# Boolean Query Parser JS

Boolean Query Parser JS (BQPJS) is Boolean query string parser.

```
let parsed = bqpjs('A AND B')
```

## Install
```
npm install bqpjs
```

BQPJS is under active development. Features and API may not be stable until a 1.x.x release. You may wish to use `--save-exact` to avoid installing breaking changes in the future.

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

### Short tokens
The following short tokens are supported:

| Token | Name | Character | Example |
|---|---|:---:|---|
 AND | Plus sign | `+` | `A + B`
 OR | Tilde | `~` | `A ~ B`
 NOT | Minus sign | `-` | `A + B - C`

### Validation
Incorrectly formatted search strings will trigger an error to be thrown.

Input: ```'A OR OR C'```

Output: ```Error: Invalid token "OR" at position 5```

### White space
White space is ignored.
* `AANDB` interpreted as `A AND B`
* 'A&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AND&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;B' interpreted as `A AND B`


## Example
`bqpjs()` takes a string representing a Boolean query. It parses the query and returns two data structures, one in reverse polish notation and the other a binary tree, that represent the query. Each is a complete representation. It is then up to the developer to process one of those to perform a search.

See [/examples](./examples) for example scripts.

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
