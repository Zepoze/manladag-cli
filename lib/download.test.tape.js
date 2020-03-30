const test = require('tape');
const processParams = require('./download').processParams

test('processParams', async (t) => {
    t.plan(13)

    t.ok((await processParams('lelscan','one-piece',973,__dirname+'/../Mangas')),'Everything is ok')
    t.ok((await processParams('lelscan','one-piece',undefined,__dirname+'/../Mangas')),'Everything is ok')
    try {
        await processParams('lelscan','one-piece',972,__dirname+'/../Manga')
        t.fail('Sould got an error')
    }catch(e) {
        t.ok(e,`Got expected error for path no valid : ${e}`)
    }

    try {
        await processParams('lelscan','one-piece',9999,__dirname+'/../Mangas')
        t.fail('Sould got an error')
    }catch(e) {
        t.ok(e,`Got expected error chapter unvailable  : ${e}`)
    }

    try {
        const res = await processParams('lelscan','one-piec',975,__dirname+'/../Mangas')
        t.fail('Sould got an error')
    }catch(e) {
        t.ok(e,`Got expected error for manga unvailable  : ${e}`)
    }

    try {
        await processParams('lelscan',3,975,__dirname+'/../Mangas')
        t.fail('Sould got an error')
    }catch(e) {
        t.ok(e,`Got expected error for manga unvailable  : ${e}`)
    }


    try {
        await processParams('lelscan','one-piece','gfh',__dirname+'/../Mangas')
        t.fail('Sould got an error')
    }catch(e) {
        t.ok(e,`Got expected error chapter unvailable  : ${e}`)
    }
    

    try {
        await processParams('lelscan','one-piece',-1,__dirname+'/../Mangas')
        t.fail('Sould got an error')
    }catch(e) {
        t.ok(e,`Got expected error chapter unvailable  : ${e}`)
    }

    try {
        await processParams({},{},{},{})
        t.fail('Sould got an error')
    }catch(e) {
        t.ok(e,`strange typeof arg : ${e}`)
    }

    try {
        await processParams('','',5)
        t.fail('Sould got an error')
    }catch(e) {
        t.ok(e,`strange typeof arg : ${e}`)
    }
    
    try {
        await processParams('','')
        t.fail('Sould got an error')
    }catch(e) {
        t.ok(e,`strange typeof arg : ${e}`)
    }
    
    try {
        await processParams('')
        t.fail('Sould got an error')
    }catch(e) {
        t.ok(e,`strange typeof arg : ${e}`)
    }
    
    try {
        await processParams()
        t.fail('Sould got an error')
    }catch(e) {
        t.ok(e,`strange typeof arg : ${e}`)
    }
    
})