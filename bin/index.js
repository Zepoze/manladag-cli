#!/bin/sh 
":" //# comment; exec /usr/bin/env node --no-warnings "$0" "$@"
const Path = require('path')
const fs = require('fs')

const nconf = require('nconf').file({file: Path.join(__dirname,'..','config.json')})
nconf.file({ file: Path.join(__dirname,'..',"config.json")})
module.exports.nconf = nconf



if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.on("SIGINT", function () {
    process.emit("SIGINT")
  })
}


var argv = require('yargs')
    .command(require('../lib/commands/download'))
    .command('wesh')
    .demandCommand(1,1)
    .option('s', {
      alias: 'source',
      choices: Object.keys(nconf.get('source')),
      type: 'string',
      describe: "Given source",
      coerce : input => input

    })
    .option('m',{
      alias: 'manga',
      describe: 'Given manga',
      type: 'string'
    })
    .option('v', {
      alias: 'verbose',
      type: 'boolean',
      default: false,
      describe: 'Output dettaillé ideal for log'
    })
    .strict()
    .argv
//console.log(argv)