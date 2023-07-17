#backend #mongodb. Hola. Quiero lograr que la búsqueda en la base de datos, no solo sea case insensitive, sino también que ignore acentos diacríticos (en las colecciones para la segunda entrega hay palabras acentuadas).
Si realizo una búsqueda por categoría (coincidencia exacta), puedo solucionarlo usando "collation". Pero cuando intento realizar una búsqueda por nombre (coincidencia parcial usando RegEx), no logro que funcione.
Ej: 
`localhost:PORT/mobiliario/nombre/oFá`: devuelve todos los elementos con coincidencia parcial. 
`localhost:PORT/mobiliario/nombre/oFa`: devuelve un array vacío. 
Quisiera obtener en ambos casos los mismos resultados.

`datos = await COLECCION.find({ nombre: RegExp('oFa', 'i') }).collation({ locale: "simple", strength: 1 }).toArray()`

Resultado esperado:
**{"_id":"64aeafee76722b04092300ad","codigo":1,"nombre":"Sofá de Cuero","precio":999.99,"categoria":"Sala de estar"}, 
{"_id":"64aeafee76722b04092300b7","codigo":11,"nombre":"Sofá Cama","precio":699.99,"categoria":"Sala de estar"}, 
{"_id":"64aeafee76722b04092300c8","codigo":28,"nombre":"Sofá Modular","precio":1199.99,"categoria":"Sala de estar"}**

Hay alguna solución para realiar esta búsqueda sin tener que modificar la colección?