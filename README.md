# Boolean Query Parser JS

Boolean Query Parse JS (BQPJS) aims to be a fully functional Boolean query string parser.

**BQPJS is under active development. Everything is subject to change.**

## How it works
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
        "start": 7,
        "end": 7
      },
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
Quarries will be evaluated in the following order in the absence of parenthesis:
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
