import fs from 'fs'
import { promisify } from 'util'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const readFile = promisify(fs.readFile)

const getLicense = () => {
  return readFile('./LICENSE', 'utf8')
    .then(file => file)
}

const getVersion = () => {
  return readFile('./package.json', 'utf8')
    .then(JSON.parse)
    .then((json)=>json.version)
}

const banner = () => {
  return Promise.all([getLicense(), getVersion()])
    .then(([license, version]) => {
      return `/*\n${license}\nVersion: ${version} - built on ${new Date}\n*/`
    })
}

module.exports = {
  input: 'src/main.js',
  output: [{
    file: 'dist/bundle.cjs.js',
    format: 'cjs',
    banner: banner
  },
  {
    file: 'dist/bundle.esm.js',
    format: 'esm',
    banner: banner
  }],
  plugins: [
    commonjs(),
    resolve()
  ]
}
