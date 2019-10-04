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
$node rpn.js 'Boolean Query here'
$node tree.js 'Boolean Query here'
```

The output of each file is the same. You can look at the contents of the file to see an example of how to process each data structure.
