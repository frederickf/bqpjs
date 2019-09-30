# Boolean Query Parser JS

Boolean Query Parse JS (BQPJS) aims to be a fully functional Boolean query string parser.

## How it works
`bqpjs()` takes a string representing a Boolean query. It parses the query and returns two data structures, one in reverse polish notation and the other a binary tree, that represent the query. Each is a complete representation. It is then up to the developer to process one of those to perform a search.

See /examples for working examples.

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
    "data": "AND",
    "type": "operator",
    "left": {
      "data": "A",
      "type": "term",
      "left": null,
      "right": null
    },
    "right": {
      "data": "B",
      "type": "term",
      "left": null,
      "right": null
    }
  }
}
```

## Features
BQPJS supports the following Boolean search syntax:

### AND
```A AND B```

And is the default operator, so `A B` equals `A AND B`

### OR
``` A OR B```

### NOT
```A NOT B```

### Quotations
```"A B" OR A OR B```

### Parenthesis
```(A OR B) AND (C OR D)```

### Nested parenthesis!
```(C AND (A OR B)) NOT D```

### Order of operations
In the absence of parenthesis quarries will be evaluated in the following order:
1. NOT
2. AND
3. OR

### Short tokens
The following short tokens are supported. **These might change before a 1.0.0 release.**

| Token | Name | Character |
|---|---|:---:|
 AND | Plus sign | `+`
 OR | Tilde | `~`
 NOT | Minus sign | `-`


## Not Features...yet

### Stemming
BQPJS doesn't currently support stemming. By stemming I mean allowing the user to communicate if they would like exact or partial matches. This might be accomplished by assuming all matches are exact and allowing for additional control characters to indicate a term should be used as a stem when matching (Ex: `A` would only match "A" exactly. `A*` would match any term that starts with "A". `*A*` would match any term that includes "A".)

For now, when you process a parsed query you'll have to decide if you want to do exact match (A = A) or a partial match (A = A, AA, AB, CAB, etc).
