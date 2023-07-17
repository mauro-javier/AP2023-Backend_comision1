// Para depurar, generar launch.json en .vscode usando
// JavaScript Debug Terminal (Ctrl + Shift + D). Permite usar breakpoints.
// npm i dotenv                                    Variables de entorno
require('dotenv').config()                      // Variables de entorno
// npm i body-parser                               Middleware
const BODY_PARSER = require('body-parser')      // Middleware
const EXPRESS = require('express'), APP = EXPRESS()
const PORT = process.env.PORT || 3009
const { leerFrutas, guardarFrutas } = require('./src/frutas.manager')

let dB = []
const HEADER = '<h1 style="text-align: center";>API-Restful</h1><hr>'
const ERROR = response => response.status(404).send('<body style="background-image: url(\'https://media.licdn.com/dms/image/C5612AQEPYce5KpNLyg/article-cover_image-shrink_720_1280/0/1551659700811?e=2147483647&v=beta&t=O9mBMiF-V12jCRJwaBNDWLKNL8cku2QSoCXtKP3vCHg\'); \
                                                                  background-repeat: no-repeat;                                                                                                                                                                           \
                                                                  background-size: contain;">                                                                                                                                                                             \
                                                    </body>')

function getId(req) {
    let paramRaw = req, param = parseInt(paramRaw), resultado
    !isNaN(param) ? resultado = dB.find(item => item.id === param)      // Es entero
                  : resultado = 'string'                                // Si el indice ingresado no es numérico
    return resultado
}

APP.use(BODY_PARSER.json())

APP.use((req, res, next) => {
    dB = leerFrutas()
    next()          // se ocupa de pasar el control de cada solicitud HTTP a
                    // la siguiente función de Middleware que exista en la pila.
})

APP.get('/', (req, res) => {
    res
        .set('Content-Type', 'text/html; charset=utf-8')
        .status(200)
        .send(HEADER + JSON.stringify(dB))
})

APP.get('/:id', (req, res) => {
    let result = getId(req.params.id)
    if (result !== 'string') {      // id es entero?
        result ? res.status(200).send(HEADER + JSON.stringify(result))
               : res.status(404).send('Error: id no hallado')
    } else {
        ERROR(res)
    }
})

APP.post('/', (req, res) => {
    let frutaNew = req.body
    let result = getId(frutaNew.id)
    if (dB.indexOf(result) === -1 ) {
        dB.push(frutaNew)
        guardarFrutas(dB)
        res.status(201).send('Registro agregado!')
    } else {
        res.status(404).send('Error: intento de agregar un id existente!')
    }
})

APP.put('/:id', (req, res) => {
    let frutaNew = req.body
    let result = getId(req.params.id)
    if (result !== 'string') {      // id es entero?
        let indice = dB.indexOf(result)
        if (indice !== -1) {
            dB[indice] = frutaNew
            guardarFrutas(dB)
            res.status(200).send('Registro modificado!')
        } else {
            res.status(404).send('Error: id no hallado')
        }
    } else {
        res.status(404).send('Error: el índice ingresado no es numérico')  // Si el indice ingresado no es numérico
    }
})

APP.delete('/:id', (req, res) => {
    let result = getId(req.params.id)
    let indice = dB.indexOf(result)
    if (result !== 'string') {      // id es entero?
        if (indice !== -1) {
            dB.splice(indice, 1)
            guardarFrutas(dB)
            res.status(200).send('Registro eliminado')    
        } else {
            res.status(404).send('Error: id no hallado')
        }
    } else {
        ERROR(res)
    }
})

APP.get('*', (req, res) => { ERROR(res) })
APP.post('*', (req, res) => { ERROR(res) })
APP.put('*', (req, res) => { ERROR(res) })
APP.delete('*', (req, res) => { ERROR(res) })

APP.listen(PORT, () => {
    console.log(`Conectado a puerto: ${PORT}`)
})