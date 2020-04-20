#!/usr/bin/env node

const lelscan = require('manladag-lelscan')
const Path = require('path')
const nconf = require('nconf')
const fs = require('fs')
const downloadPath = Path.join(__dirname,'..','Mangas')
const configPath = Path.join(__dirname,'..','config.json')
let dnow = new Date(Date.now())
dnow = `${dnow.getFullYear()}-${dnow.getMonth()}-${dnow.getDate()}`

class tmp {}

function processs(source) {
    const keys = Object.keys(source.mangas)

    keys.forEach((e) => {
        nconf.set(`source:${source.site.toLowerCase()}:${e}`,{
            "last-chapter-available": 0,
            "last-check" : dnow
        })
    })
}

if(!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath)
if(fs.existsSync(configPath)) return console.log('config already set')
nconf.file({ file: Path.join(__dirname,'..',"config.json")})



nconf.set("download-path", downloadPath)
processs(lelscan(tmp))
nconf.set("preferences", {
    download:{
        zip: false,
        pdf:true,
        clean: false
    }
})

nconf.save()