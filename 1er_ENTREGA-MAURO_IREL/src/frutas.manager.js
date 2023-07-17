const FS = require('fs')
require('dotenv').config()

const PATH = __dirname + process.env.DATABASE_PATH || __dirname + '\\database\\frutas.json'

function guardarFrutas(frutasObjeto) {
    const frutasJSON = JSON.stringify(frutasObjeto)
    FS.writeFileSync(PATH, frutasJSON, 'utf-8')
}

function leerFrutas() {
    const frutasObjeto = FS.readFileSync(PATH, 'utf-8')
    return JSON.parse(frutasObjeto)
}

module.exports = { leerFrutas, guardarFrutas }