const fs = require('fs')
const os = require('os')
const Path= require('path')

let path = Path.resolve(__dirname,'bin/index.js')

if(fs.existsSync(path)) {
    if(fs.lstatSync(path).isDirectory()) {
        console.log(`a new file with default name in ${path}`)
    } else {
        console.log(`you cant overwrite ${path}`)
    }
} else {
    if(fs.existsSync(tmp = Path.join(path,'..'))) {
        console.log(`a new file with ${Path.basename(path)} name in ${tmp}`)
    } else {
        console.log(`this folder doesn't exist : ${tmp}`)
    }
}