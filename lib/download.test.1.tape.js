const test = require('tape');
const download = require('./download').download

test('Downlaoad', async (t) => {
    t.plan(3)
    t.ok(await download('lelscan','one-piece',973,__dirname+'/../Mangas'))
    t.ok(await download(require('manladag-lelscan')(require('./source')()),'one-piece',undefined,__dirname+'/../Mangas'))
    t.ok(await download('lelscan','one-piece',972,__dirname+'/../Mangas',{pdf:false,zip:true}))

    
})