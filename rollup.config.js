import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

module.exports = {
  input: 'src/main.js',
  output: [{
    file: 'dist/bundle.cjs.js',
    format: 'cjs'
  },
  {
    file: 'dist/bundle.esm.js',
    format: 'esm'
  }],
  plugins: [
    commonjs(),
    resolve()
  ]
}
