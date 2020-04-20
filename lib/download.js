const consola = require('consola')
const chalk = require('chalk')
const fs = require('fs')
const Path = require('path')
const rimraf = require('rimraf')
const Signals = require('./signal')
const os = require('os')

async function download(s,manga_key,chap,dir,opts) {
    const source = typeof(s) == 'string' ? require('./getsource')(s) : s

    
    const { path, chapter, needforce, manga } = await processParams(source,manga_key,chap,dir,opts.force)
    
    event(source,opts.verbose)

    let downloadAborted
    try {
        process.on('SIGINT',downloadAborted = () => {
            console.log()
            consola.info("donwload aborted")
            if(fs.existsSync(path))
                rimraf.sync(path)
            console.log('------------------------ ', (opts.verbose) ? chalk.redBright('ABORT') : '')
            process.exit(1)
            
        })


        await source.downloadChapter(manga_key,chapter,path)

        process.removeListener('SIGINT',downloadAborted)
        
        let tmppath
        if(fs.existsSync(tmppath = Path.join(dir,source.site,manga,chapter.toString()))) rimraf.sync(tmppath)
        fs.renameSync(path,tmppath)
        if(opts.verbose) console.log('\n',chalk.green(`${path}  ->  ${tmppath}`))
        
        if(needforce) {
            
            console.log('Chapter has been overwritten')
        }

        ['zip','pdf','web-render'].forEach(e => opts[e] = opts[e] == true ? process.env.PWD : opts[e])
        await source.processChapter(tmppath,manga_key,chapter,opts)
    
    } catch(e) {

        
        throw e
        
    } finally {
        if(fs.existsSync(path))
            rimraf.sync(path)
    }
    
    
    
    return 1
}

async function processParams(s, manga_key, chapter, path,force) {

    if(typeof(s) == 'undefined') throw new Error(`s should be a string or Source class but it's '${typeof(s)}'`)

    const source = typeof(s) == 'string' ? require('./getsource')(s) : s

    if(typeof(source.site) != 'string') throw new Error(`source.site should be a string but it's '${typeof(source.site)}'`)

    if(typeof(manga_key) != 'string') throw new Error(`manga_key should be a string but it's '${typeof(manga_key)}'`)

    if(chapter<0 || (typeof(chapter) != 'number' && typeof(chapter) != 'undefined')) throw new Error(`chapter should be a number >= 0 but here it's '${chapter}'`)

    if(typeof(path) != 'string') throw new Error(`path should be a string but it's '${typeof(path)}'`)

    
    let needforce = false
    if (!Object.keys(source.mangas).some( e => e == manga_key))
      throw new Error(`The manga '${manga_key}' is not available on ${source.site}'s lib`)

    const thechapter = chapter || (await source.getLastChapter(manga_key))
    try {
        if(!await source.chapterIsAvailable(manga_key, thechapter)) 
            throw new Error(`The ${source.mangas[manga_key].name}' chapter n°${chapter} is not available on ${source.site}`)
    }catch(e) {
        throw new Error(`Impossible to access to ${source.url} plz check your Internet's connection or signal a dead link`)
    }
    let thepath,themanga

    if(fs.existsSync(thepath = path)) {
      
      if(!fs.existsSync(thepath = Path.join(path,source.site))){
        fs.mkdirSync(thepath)
      }
      if(!fs.existsSync(thepath = Path.join(thepath,themanga = source.mangas[manga_key].name))) {
        fs.mkdirSync(thepath)
      }
      if(!fs.existsSync(thepath = Path.join(thepath,thechapter.toString()))) {
        
        thepath = fs.mkdtempSync(Path.join(os.tmpdir(),`${manga_key.toLowerCase()}-${thechapter}`))
      
      }
      else if(!force){
        const e = new Error(`The chapter n°${thechapter} of ${source.site}'s ${source.mangas[manga_key].name} seem already download\n\tPlease use -f to redownload or choose an other download's path`)
        e.help = true
        throw e
      } else {
        needforce = true
        console.log('force is enabling so try overwrite')
        thepath = fs.mkdtempSync(Path.join(os.tmpdir(),`overwrite-${manga_key.toLowerCase()}-${thechapter}`))
      }
      
    } else throw new Error(`The path ${path} doesn't exist ??`)


    return { path : thepath, chapter: thechapter, needforce, manga: themanga }
}

function event(s,verbose) {
    s
        .on('number-of-page',(nbPages) => {
            consola.info(`contain ${nbPages} pages`)
        })
        .on('chapter-download-started', ({ manga, chapter, path }) => {
            consola.info(`The download of ${manga} ${chapter} start!`)
        })
        .on('chapter-download-finished', ({ manga, chapter }) => {
            consola.success(`\n${manga} ${chapter} downloaded !`)
        })
        .on('page-download-finished', ({ page, path="wesh" }) => {
            if(!verbose)
                consola.success(`${page} downloaded !`)
            else  {
                console.log(chalk.green('\tdone -> '+path))
            }
        })
        .on('page-download-error', ({ page, path }) => {
            if(!verbose)
                consola.log(`${page} error !`)
            else  {
                console.log(chalk.red('\tfailed -> '+path))
            }
        })
        .on('chapter-download-error', () => {
            consola.info('chapter download failed !')
        })
        .on('chapter-zip-started', () => {
            consola.info('zip started')
        })
        .on('chapter-zip-finished', ({path}) => {
            consola.info('zip finished -> ',path)
        })
        .on('chapter-zip-error', (e) => {
            consola.info('zip error')
            console.log(e)
        })
        .on('chapter-pdf-started', () => {
            consola.info('pdf started')
        })
        .on('chapter-pdf-finished', ({path}) => {
            consola.info('pdf finished -> ',path)
        })
        .on('chapter-pdf-error', (e) => {
            consola.info('pdf error')
            console.log(e)
        })
        if(verbose) {
            s.on('page-download-started', ({ page, path="wesh" }) => {
                consola.info(`page ${page}`)
            })
        }
        return s
        
}
module.exports.processParams = processParams

module.exports.download = download

module.exports.events = event