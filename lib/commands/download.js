#!/bin/sh 
":" //# comment; exec /usr/bin/env node --no-warnings "$0" "$@"

'use strict'
const Path = require('path')
const fs = require('fs')
const consola = require('consola')
const chalk = require('chalk')

const nconf = require('nconf').file({file: Path.join(__dirname,'..','..','config.json')})

const download = require('../download').download

module.exports.command = 'download [dir]'

module.exports.describe = 'Download a chapter from a given source and manga'

module.exports.builder = (y) => {
    y.positional('dir',{
      alias: 'folder',
      describe: 'Download Path',
      default: nconf.get('download-path'),
      defaultDescription: 'download-path config',
      coerce: (input) => Path.isAbsolute(input) ? input : Path.join(process.env.PWD, input)
    })
    .option('s',{
        describe: 'Source for download'
    }) // source option from app
    .option('m',{
      describe: 'Manga for download'
    }) // manga option from app
    .option('c',{
      alias: 'chapter',
      type:'number',
      defaultDescription:'last available',
      describe:'Chapter to download'
    })
    .option('f', {
      alias: ['force','force-download'],
      describe: 'Flag to force dowwnload',
      type: 'boolean',
      default: false
    })
    .group(['s','m','c','f'],"Download Options")
    .option('pdf', {
      alias: 'p',
      type: 'boolean',
      defaultDescription: 'Config if any Process Option',
      describe: 'Create PDF from downloaded chapter'
    })
    .option('z', {
      alias: 'zip',
      type: 'boolean',
      defaultDescription: 'Config if any Process Option',
      describe: 'Create Zip from downloaded chapter'
    })
    .option('web-render', {
      alias: 'web',
      type: 'boolean',
      default:false,
      describe: 'Make a static web page for chapter if clean option is set to false'
    })
    .option('clean', {
      alias: ['no-jpg','j'],
      type: 'boolean',
      defaultDescription: 'Config if any Process Option',
      describe: 'Remove jpg file from downloaded chapter only if zip or pdf are made'
    })
    .group(['pdf','zip','clean', 'web-render'],'Process Options')
    .demandOption('s',"Source is not indicated")
    .demandOption('m',"Manga is not indicated")
    .check((args) => {
      if(args.web && args.j) throw new Error('You cant delete images chapter and make a static web page :(\n\(it\'s logic)')
      if(typeof(args.c)!= 'undefined') {
        if(!args.c >0 ) throw new Error('chapter option need to be a valid number')
      }
      if(!fs.lstatSync(args.folder).isDirectory()) throw new Error(`The path ${args.folder} isn't dir ?`)
      return true
    })
    .fail((msg,err,yargs) => {

      if(msg) {
        console.log(yargs.help()+'\n')
        console.log(msg)
        return process.exit(1)
      }

      if(typeof(err)!='undefined') {
        if(err!=0) {
          yargs.help()
          console.log(err.message)
        }
        
      }
      process.exit(1)

      throw err
    })
    return y
  }


  module.exports.handler = async ({source, manga, chapter, folder, pdf, zip, clean, verbose, force, web }) => {
    try {
      const now = new Date(Date.now())
      console.log('------------------------ ', (verbose) ? chalk.cyanBright('START ' + [now.getDate(),now.getMonth()+1,now.getFullYear()].join('/') + ' '+ [now.getHours(),now.getMinutes(),now.getSeconds()].join(':')) : '' )
      if(verbose) {
        console.log('- '+chalk.greenBright('Source : ')+source)
        console.log('- '+chalk.greenBright('Manga : ')+manga+'\n')
      }

      const defconfig = typeof(zip) == 'undefined' && typeof(clean) == 'undefined' && typeof(pdf) == 'undefined'
      if(defconfig) consola.info("Default config will be used")

      await download(source,manga,chapter,folder, {
        verbose,
        force,
        pdf: defconfig ? nconf.get("preferences:download:pdf"): pdf || false,
        zip: defconfig ? nconf.get("preferences:download:zip"): zip || false,
        jpg: defconfig ? nconf.get("preferences:download:clean"): clean || false,
        web
      })
      console.log('------------------------',(verbose) ? 'SUCESS' : '')
    } catch(e) {
      consola.error(e.message)
      console.log('------------------------ ',(verbose) ? chalk.redBright('FAIL') : '')
      throw 0
      //process.exit(1)
    }
  }