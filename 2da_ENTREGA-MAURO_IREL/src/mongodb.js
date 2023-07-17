require('dotenv').config()

const { MongoClient } = require('mongodb')
const URI = `mongodb+srv://${process.env.MDB_USER}:${process.env.MDB_PWD}@${process.env.MDB_DB}.dy8fiiy.mongodb.net/?retryWrites=true&w=majority`
const CLIENT = new MongoClient(URI)

async function connectToMDB() {
    try {
        await CLIENT.connect()
        console.log('Conectado a MongoDB')
        return CLIENT
    } catch (err) {
        console.log('Error al conectar a MongoDB:', err)
    }
}

async function disconnectFromMDB() {
    try {
        await CLIENT.close()
        console.log('Desconectado de MongoDB')
    } catch (err) {
        console.log('Error al desconectar de MongoDB:', err)
    }
}

module.exports = { connectToMDB, disconnectFromMDB }