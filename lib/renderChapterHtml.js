const ejs = require('ejs')
const Path = require('path')
const fs = require('fs')
async function renderHtml(path,topath,{site,url,manga,chapter} = {}) {
    let pathhtml

    if(fs.existsSync(topath)) {
        if(fs.lstatSync(topath).isDirectory())
            pathhtml = Path.join(topath,`${this.site}-${normalize(this.mangas[manga_index].name)+chapter}.pdf`)
        else throw new Error('Cant overite this file : ',topath)
    } else if(fs.existsSync(Path.join(topath,'..'))){
        pathhtml= Path.extname(Path.basename(topath)) != '.html' ? topath+'.html' :topath
    } else throw new Error('this directory doesnt exist')

    const files = fs.readdirSync(path).map(e => {
        if(Path.extname(e)== '.jpg' || Path.extname(e)== '.png') return Path.join(path,e)
    })

    const str = await 
        ejs.renderFile(Path.join(__dirname,'..','assets','index.ejs'),{files: files,site,url,manga,chapter})
    fs.writeFileSync(Path.join(topath),str)
    
}
module.exports =  renderHtml