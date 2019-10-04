# Examples

The files in this directory offer some command line scripts that act as examples of how to use Boolean Query Parser JS.

## Generate test data
Before you can use the example files you must generate some sample data using data-gen.js.

```
$ node data-gen.js
```

This will create a file in this directory called test-data.json.

## Example scripts
Once you have some data to query you can use rpn.js and tree.js to run queries.

```
$ node rpn.js 'Boolean query here'
$ node tree.js 'Boolean query here'
```

You can look at the contents of the file to see an example of how to process each data structure. The output of each file is the same for a given query.

If you want to see the output of bqpjs() itself, you can run bqpjs-formats.js

```
$ node bqpjs-formats.js 'Boolean query here'
```
