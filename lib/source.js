const Path = require('path')
const Event = require('events')
const fs = require('fs')
const { zip } = require('zip-a-folder')
const { ImagesToPDF } = require('images-pdf')
const rimraf = require('rimraf')
const nconf = require('nconf').file({file: Path.join(__dirname,'..','config.json')})
nconf.file({ file: Path.join(__dirname,'..',"config.json")})
const renderHtml = require('./renderChapterHtml')

function normalize(name) {
    return name.toLowerCase().replace(/\ /gi,'-')
}
module.exports = () => {
    class Source {
    //downloadChapter need to return path of the images folder
        static async downloadChapter(manga_index,chapter,path) {
            let error
            if(typeof(this._downloadChapter) != 'function') {
                error = new Error(`The download chapter Strategie of ${this.site} is missing`)
                this.emit('strategie-missing', error)
                throw error
            }
            else {
                this.emit('chapter-download-started',{ manga: this.mangas[manga_index].name, chapter , source: this.site,path})
                
                try {
                    path = await this._downloadChapter(manga_index,chapter,path)
                    this.emit('chapter-download-finished', { manga: this.mangas[manga_index].name, chapter, path , source: this.site})
                } catch(e) {
                    this.emit('chapter-download-error',{error: e, path, manga: this.mangas[manga_index].name, source: this.site})
                    throw e
                }

                return path
            }
        }
        static async downloadLastChapter(manga_index) {
            return this.downloadChapter(manga_index, await this.getLastChapter(manga_index))
        }
        
        static async getLastChapter(manga_index) {
            let error
            if(typeof(this._getLastChapter) != 'function'){
                error = new Error(`The get Last chapter Strategie of ${this.site} is missing`)
                this.emit('strategie-missing', error)
                throw error
            }else {
                try {
                    const chap = await this._getLastChapter(manga_index)
                    nconf.set(`source:${normalize(this.site)}:${manga_index}:last-chapter-available`, chap)

                    nconf.set(`source:${normalize(this.site)}:${manga_index}:last-check`, ((n)=> `${n.getFullYear()}-${n.getMonth()}-${n.getDate()}`)(new Date(Date.now())))
                    nconf.save()
                    return chap
                } catch(e) {
                    const error = new Error(`Impossible to access to ${this.url}, please check your internet Connection and report a bug or a dead link `)
                    this.emit('get-last-chapter-error', {source: this.site, error , manga: this.mangas[manga_index].name})
                    throw error
                }
            }
        }
        static async chapterIsAvailable(manga_index,chapter) {
            let error
            if(typeof(this._chapterIsAvailable) != 'function'){
                error = new Error(`The check chapter Strategie of ${this.site} is missing`)
                this.emit('strategie-missing', error)
                throw error
            }else {
                try {
                    return await this._chapterIsAvailable(manga_index,chapter)
                } catch(e) {
                    this.emit('chapter-is-available-error', e)
                    throw e
                }
            }
        }
        
        static async zipChapter(manga_index,chapter,path,topath) {
            this.emit('chapter-zip-started', {
                source: this.site,
                manga : this.mangas[manga_index].name,
                chapter
            })
            try {
                let pathzip

                if(fs.existsSync(topath)) {
                    if(fs.lstatSync(topath).isDirectory())
                        pathzip = Path.join(topath,`${this.site}-${normalize(this.mangas[manga_index].name)+chapter}.zip`)
                    else throw new Error('Cant overite this file : ',topath)
                } else if(fs.existsSync(Path.join(topath,'..'))){
                    pathzip = Path.extname(Path.basename(topath)) != '.zip' ? topath+'.zip' :topath
                } else throw new Error('this directory doesnt exist')


                await zip(path, pathzip)
                this.emit('chapter-zip-finished', {
                    source: this.site,
                    manga : this.mangas[manga_index].name,
                    chapter,
                    path: pathzip
                })
            }
            catch(error) {
                this.emit('chapter-zip-error', {
                    source: this.site,
                    manga : this.mangas[manga_index].name,
                    chapter,
                    error
                    
                })
            }
        }

        static async pdfChapter(manga_index,chapter,path,topath) {
            this.emit('chapter-pdf-started', {
                source: this.site,
                manga : this.mangas[manga_index].name,
                chapter
            })
            try {
                let pathpdf

                if(fs.existsSync(topath)) {
                    if(fs.lstatSync(topath).isDirectory())
                        pathpdf = Path.join(topath,`${this.site}-${normalize(this.mangas[manga_index].name)+chapter}.pdf`)
                    else throw new Error('Cant overite this file : ',topath)
                } else if(fs.existsSync(Path.join(topath,'..'))){
                    pathpdf= Path.extname(Path.basename(topath)) != '.pdf' ? topath+'.pdf' :topath
                } else throw new Error('this directory doesnt exist')

                new ImagesToPDF().convertFolderToPDF(path, pathpdf)
                this.emit('chapter-pdf-finished', {
                    source: this.site,
                    manga : this.mangas[manga_index].name,
                    chapter,
                    path : pathpdf
                })
            }
            catch(error) {
                this.emit('chapter-pdf-error', {
                    source: this.site,
                    manga : this.mangas[manga_index].name,
                    chapter,
                    error
                })
            }
        }

        static async renderHtmlChpter(manga_index,chapter,path,topath) {
            console.log('make html started')
            await renderHtml(path,topath,{site: this.site, url:this.url,chapter,manga: this.mangas[manga_index].name})
            console.log('html created')
        }

        static async processChapter(path, manga_index, chapter, {pdf = true,zip = false,jpg = false,web =false} = {pdf : true,zip : false,jpg : false,web : false}) {
            if(zip) await this.zipChapter(manga_index, chapter, path,zip)
            if(pdf) await this.pdfChapter(manga_index, chapter, path,pdf)
            if(web && !jpg) await this.renderHtmlChpter(manga_index,chapter,path,web)
            if(jpg && fs.existsSync(path)) rimraf.sync(path)

        }

        static on(string, func) {
            return this.event.on(string, func)
        }

        static emit(string, payload) {
            return this.event.emit(string, payload)
        }

        static removeListener(string,payload) {
            return this.event.removeListener(string,payload)
        }
            
    }
    Source.event = new Event()
    Source.site =''
    Source.url = ''
    Source.mangas = {}

    return Source
}


