const ejs = require('ejs')
const Path = require('path')
const fs = require('fs')
async function renderHtml(path,{site,url,manga,chapter} = {}) {
    const files = fs.readdirSync(path).map(e => {
        if(Path.extname(e)== '.jpg' || Path.extname(e)== '.png') return Path.join(path,e)
    })

    const str = await 
        ejs.renderFile(Path.join(__dirname,'..','assets','index.ejs'),{files: files,site,url,manga,chapter})
    fs.writeFileSync(Path.join(path,'index.html'),str)
    
}
module.exports =  renderHtml