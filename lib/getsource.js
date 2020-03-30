const SourceBase = require('./source')
module.exports = (s) => {
    if(typeof(s) != 'string') throw new Error(`Source should be a string but it's a ${typeof(source)}`)
    switch(s) {
      case 'lelscan': 
        return require('manladag-lelscan')(SourceBase())
      default:
        throw new Error('source not available')
    }
}