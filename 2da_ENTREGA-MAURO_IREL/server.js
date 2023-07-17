// Palabra SCRATCH usada para marcar código utilizado de funcionamiento alternativo/mejoras.
// require('dotenv').config(): usado en mognodb.js
const { connectToMDB, disconnectFromMDB } = require('./src/mongodb')
const EXPRESS = require('express'), APP = EXPRESS()
const PORT = process.env.PORT ?? 3013

// HEADER y ERROR usados para estilizar la respuesta del método GET invocado desde el navegador.
const HEADER = '<h2 style="text-align: center";>Argentina Programa 2023 - Backend comisión 1 <br/>2da Entrega - CRUD con MongoDB</h2><hr>'
const ERROR = response => response.status(404).send('<body style="background-image: url(\'https://media.licdn.com/dms/image/C5612AQEPYce5KpNLyg/article-cover_image-shrink_720_1280/0/1551659700811?e=2147483647&v=beta&t=O9mBMiF-V12jCRJwaBNDWLKNL8cku2QSoCXtKP3vCHg\'); \
                                                                  background-repeat: no-repeat;                                                                                                                                                                           \
                                                                  background-size: contain;">                                                                                                                                                                             \
                                                    </body>');

const ENDPOINTS = ['computacion', 'electronicos', 'granjas', 'mobiliario', 'prendas', 'supermercado']

APP.use(EXPRESS.json())

APP.use((req, res, next) => {
    res.set('Content-Type', 'text/html; charset=utf-8')
    next()
})

// Usada para buscar nombres en forma parcial e ignorar palabras acentuadas tanto en la url como en la colección.
function diacriticSensitiveRegex(nombre) { 
    return nombre
       .replace(/a/g, '[a,á,à,ä,â]')
       .replace(/A/g, '[A,a,á,à,ä,â]')
       .replace(/e/g, '[e,é,ë,è]')
       .replace(/E/g, '[E,e,é,ë,è]')
       .replace(/i/g, '[i,í,ï,ì]')
       .replace(/I/g, '[I,i,í,ï,ì]')
       .replace(/o/g, '[o,ó,ö,ò]')
       .replace(/O/g, '[O,o,ó,ö,ò]')
       .replace(/u/g, '[u,ü,ú,ù]')
       .replace(/U/g, '[U,u,ü,ú,ù]');
   }

APP.get('/*', async (req, res) => {
/*  #########################################################################
    EP ==> EndPoint del tipo: | EP [1] |      EP[2]       | EP[3]  |
                              /endpoint/[atributo o código/busqueda]
    #########################################################################  */
    // "decodeURI": para permitir caracteres ascii extendido (tildes y ñ)
    // "replace": para eliminar diacríticos de la url. 
    const EP = decodeURI(req.url).normalize("NFD").replace(/[\u0300-\u036f]/g, "").split('/')
    if (ENDPOINTS.includes(EP[1])) {
        const CLIENT = await connectToMDB()
        if (CLIENT) {
            const COLECCION = CLIENT.db('AP2023-Backend-Comi1-2do_Integrador').collection(EP[1])
            let query, datos = []
            if (EP.length === 2) {                                  // 4. a.        URL: localhost:PORT/endpoint
                query = {}
            } else if (EP.length === 3) {                           // 4. b.        URL: localhost:PORT/endpoint/codigo
                query = { 'codigo': parseInt(EP[2]) }
            } else if (EP.length === 4 && EP[2] === 'nombre') {     // 4. c. - 5.   URL: localhost:PORT/endpoint/nombre/nombreParcial
                query = { [EP[2]]: RegExp(diacriticSensitiveRegex(EP[3]), 'i') }    
            } else if (EP.length === 4 && EP[2] === 'categoria') {  // 4. d. - 5.   URL: localhost:PORT/endpoint/categoria/coincidenciaExacta-CaseInsensitive&DiacriticsInsensitive
                query = { [EP[2]]: EP[3] }
            }
            if (query) {
                datos = await COLECCION.find(query).collation({ locale: "es", strength: 1 }).toArray()  // collation con strength 1: insensible a Mayúsc/Minúsc y Diacríticos. No funciona con RegExp
                datos.length ? res.status(201).send(HEADER + JSON.stringify(datos))
                             : res.status(404).send(HEADER + 'No se hallaron elementos')
            } else {
                ERROR(res)
            }
            await disconnectFromMDB()
        } else {
            res.status(500).send(HEADER + 'Error al conectarse a MongoDB')
        }
    } else { 
        ERROR(res)
    }
})

APP.post('/*', async (req, res) => {    // 4. e.
/*  #########################################################################
    URL:
    localhost:PORT/endpoint
    BODY:
    {
        "codigo":integer,
        "nombre":'string',
        "precio":float,
        "categoria":'string'
    } 
    #########################################################################  */
    const EP = req.url.split('/')
    const ELEMENTO = req.body
    ELEMENTO.codigo = parseInt(ELEMENTO.codigo)
    ELEMENTO.precio = parseFloat(ELEMENTO.precio)
    if (ENDPOINTS.includes(EP[1]) && EP.length === 2) {
        if (!isNaN(ELEMENTO.codigo) && ELEMENTO.nombre !== '' && !isNaN(ELEMENTO.precio) && ELEMENTO.categoria !== '') {
            const CLIENT = await connectToMDB()
            if (CLIENT) {
                const COLECCION = CLIENT.db('AP2023-Backend-Comi1-2do_Integrador').collection(EP[1])
                let buscarID = await COLECCION.find({ 'codigo': ELEMENTO.codigo }).toArray()
                if (!buscarID.length) {
                    await COLECCION.insertOne(ELEMENTO)
                                   .then(() => {
                                        res.status(201).send('Se agregó el elemento: ' + JSON.stringify(ELEMENTO))
                                   })
                                   .catch(error => {
                                        res.status(404).send(`Error al consultar la colección: ${error}`)        
                                   })
                } else {
                    res.status(404).send('El código del elemento a agregar ya existe en la base de datos.')
                }
                await disconnectFromMDB()
            } else {
                res.status(500).send('Error al conectarse a MongoDB')
            } 
        } else {
            res.status(404).send('Error en el formato del elemento a cargar')
        }
    } else { 
        res.status(404).send('El endpoint no existe')
    }
})

APP.put('/*', async (req, res) => {     // 4. f. - 6.
/*  #########################################################################
    URL:
    localhost:PORT/endpoint/codigo
    BODY:
    {
        "precio":float
    }
    ######################################################################### */
    const EP = req.url.split('/')
    const ELEMENTO = req.body
    ELEMENTO.precio = parseFloat(ELEMENTO.precio)
    if (ENDPOINTS.includes(EP[1]) && EP.length === 3) {
        if (!isNaN(ELEMENTO.precio)) {
            const CLIENT = await connectToMDB()
            if (CLIENT) {
                const COLECCION = CLIENT.db('AP2023-Backend-Comi1-2do_Integrador').collection(EP[1])
                let buscarID = await COLECCION.find({ 'codigo': parseInt(EP[2]) }).toArray()
                if (buscarID.length) {
                    await COLECCION.updateOne({ codigo: parseInt(EP[2]) }, { $set: { precio: ELEMENTO.precio } })      // 7.
                                   .then((resultado) => {
                                        resultado.modifiedCount ? res.status(201).send(`Smodificó el código ${ELEMENTO.precio}`)    
                                                                : res.status(404).send(`No se modificó el código ${EP[2]}`)    
                                   })
                                   .catch(error => {
                                        res.status(404).send(`Error al consultar la colección: ${error}`)        
                                   })
                } else {
                    res.status(404).send('El código del elemento a modificar no existe en la base de datos.')
                }
                await disconnectFromMDB()
            } else {
                res.status(500).send('Error al conectarse a MongoDB')
            } 
        } else {
            res.status(404).send('Error en el formato del elemento a cargar')
        }
    } else { 
        res.status(404).send('El endpoint no existe')
    }
})

APP.delete('/*', async (req, res) => {  // 4. g. - 6.
/*  #########################################################################
    URL
    localhost:PORT/endpoint/codigo
    #########################################################################  */
    const EP = req.url.split('/')
    if (ENDPOINTS.includes(EP[1]) && EP.length === 3) {
        const CLIENT = await connectToMDB()
        if (CLIENT) {
            const COLECCION = CLIENT.db('AP2023-Backend-Comi1-2do_Integrador').collection(EP[1])
            let buscarID = await COLECCION.find({ codigo: parseInt(EP[2]) }).toArray()
            if (buscarID.length) {
                await COLECCION.deleteOne({ codigo: parseInt(EP[2]) })
                               .then((resultado) => {
                                    resultado.deletedCount ? res.status(204).send(`Se eliminó el código ${EP[2]}`)    
                                                           : res.status(404).send(`No se pudo eliminar el código ${EP[2]}`)    
                               })
                               .catch(error => {
                                    res.status(404).send(`Error al consultar la colección: ${error}`)
                               })
            } else {
                res.status(404).send('El código del elemento a eliminar no existe en la base de datos.')
            }
            await disconnectFromMDB()
        } else {
            res.status(500).send('Error al conectarse a MongoDB')
        } 
    } else { 
        res.status(404).send('El endpoint no existe')
    }
})

APP.listen(PORT, () => {
    console.log(`Conectado al puerto: ${PORT}`)
})