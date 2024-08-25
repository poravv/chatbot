const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require('dotenv').config();
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
//const MockAdapter = require('@bot-whatsapp/database/mock')
const JsonAdapter = require('@bot-whatsapp/database/json')
//const MongoAdapter = require('@bot-whatsapp/database/mongo')
const path = require('path')
const fs = require('fs')

const bienvenidaPath = path.join(__dirname, "mensajes", "Bienvenida.txt")
const bienvenida = fs.readFileSync(bienvenidaPath, 'utf-8');

const itemsPath = path.join(__dirname, "mensajes", "ItemsBienvenida.txt")
const ItemsBienvenida = fs.readFileSync(itemsPath, 'utf-8');

const itemsConsultasPath = path.join(__dirname, "mensajes", "ItemsConsultas.txt")
const ItemsConsultas = fs.readFileSync(itemsConsultasPath, 'utf-8');

//---------------------------------------------------------------

const bienvenidaFlow = addKeyword(['ola','hola', 'Hola', 'buenas', 'hello', 'holi', 'hole', 'buenos', '!consulta'])
    .addAnswer(bienvenida, { delay: 3000, })
    .addAnswer(
        ItemsBienvenida,
        {
            capture: true,
            delay: 5000,
        },
        async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
            if (!["a", "b", "c", "d", "e", "f", "g","0"].includes(ctx.body.toLowerCase())) {
                return fallBack(
                    "Respuesta no válida, por favor selecciona una de las opciones."
                );
            }
            switch (ctx.body.toLowerCase()) {
                case "a":
                    return gotoFlow(flowConsultas);
                case "b":
                    return gotoFlow(flowConsultas);
                case "c":
                    return gotoFlow(flowConsultas);
                case "d":
                    return gotoFlow(flowConsultas);
                case "e":
                    return gotoFlow(flowConsultas);
                case "f":
                    return gotoFlow(flowConsultas);
                case "g":
                    return gotoFlow(flowConsultas);
                case "0":
                    return await flowDynamic(
                        "Saliendo... Puedes volver a acceder a este chat escribiendo !consulta"
                    );
            }
        }
    );


const flowConsultas = addKeyword([EVENTS.ACTION])
    .addAnswer(ItemsConsultas, { capture: true },
        async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
            if (!["a", "b", "c", "d", "e", "f","0"].includes(ctx.body.toLowerCase())) {
                return fallBack(
                    "Respuesta no válida, por favor selecciona una de las opciones."
                );
            }
            switch (ctx.body.toLowerCase()) {
                case "a":
                    return gotoFlow(flowAdministrativo);
                case "b":
                    return gotoFlow(flowFinal);
                case "c":
                    return gotoFlow(flowFinal);
                case "d":
                    return gotoFlow(flowFinal);
                case "e":
                    return gotoFlow(flowFinal);
                case "f":
                    return gotoFlow(flowMalla);
                case "0":
                    return await flowDynamic(
                        "Saliendo... Puedes volver a acceder a este chat escribiendo !consulta"
                    );
            }
        })

const flowFinal = addKeyword([EVENTS.ACTION])
    .addAnswer('Podrias darme el detalle de tu consulta?', { capture: true }, async (ctx, ctxFn) => {
        //const consulta = ctx.body;
        await ctxFn.flowDynamic("Gracias, te respondere la duda en la brevedad posible")
        await ctxFn.flowDynamic("Saludos!")
    })

const flowMalla = addKeyword(EVENTS.ACTION)
    .addAnswer('Aqui te facilito la malla curricular', {
        delay: 2000,
        media: "https://imgv2-1-f.scribdassets.com/img/document/388490145/original/7e50eca805/1723633189?v=1"
    })


//https://wa.me/595992756462?text=<mensaje_personalizado>


const flowAdministrativo = addKeyword([EVENTS.ACTION])
    .addAnswer('Puedes comunicarte a https://wa.me/595992756462')

const main = async () => {
    /*
    const adapterDB = new MongoAdapter({
        dbUri: process.env.MONGO_DB_URI,
        dbName:"cliente001"
    })
    */

    const adapterDB = new JsonAdapter()
    const adapterFlow = createFlow([
        bienvenidaFlow,
        flowFinal,
        flowConsultas,
        flowMalla
    ])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
