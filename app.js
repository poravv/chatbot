const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
require('dotenv').config();
const express = require('express');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
//const JsonAdapter = require('@bot-whatsapp/database/json');
//const MongoAdapter = require('@bot-whatsapp/database/mongo');
const pool = require('./dbConfig');
const path = require('path');
const fs = require('fs');
let idusuario = '595992424757';

const app = express();
const port = 3000;

app.use(express.static('public'));

const bienvenidaPath = path.join(__dirname, "mensajes", "Bienvenida.txt")
const bienvenida = fs.readFileSync(bienvenidaPath, 'utf-8');

const itemsPath = path.join(__dirname, "mensajes", "ItemsBienvenida.txt")
const ItemsBienvenida = fs.readFileSync(itemsPath, 'utf-8');

const itemsConsultasPath = path.join(__dirname, "mensajes", "ItemsConsultas.txt")
const ItemsConsultas = fs.readFileSync(itemsConsultasPath, 'utf-8');


let clienteInfo = {};

//---------------------------------------------------------------

const flowInicial = addKeyword(['hola', 'Hola', 'Buenas', 'buenas', 'Buenos', 'buenos', '!consulta'])
    .addAction(async (ctx, { gotoFlow, state, flowDynamic }) => {

        const timeoutId = handleInactivity(state, gotoFlow);
        await state.update({ timeoutId: timeoutId });

        const myState = state?.getMyState();

        if (myState && myState.iniciado) {
            if (myState.enCurso) {
                console.log('Conversación en curso, continuando...');
                return gotoFlow(myState.enCurso);
            } else {
                return gotoFlow(bienvenidaFlow);
            }
        } else {
            // Estado no encontrado, iniciar conversación
            await state.update({ iniciado: true, enCurso: bienvenidaFlow });
            return gotoFlow(bienvenidaFlow);
        }
    });


const bienvenidaFlow = addKeyword([EVENTS.ACTION])
    .addAnswer(
        `Buenas soy Dr. Ariel Santander Director Médico. 🫱🏽‍🫲🏾`,
        { delay: 2000, }
    ).addAnswer(`Mis horarios de atención  para los alumnos  son: Lunes Marte y Miércoles de 8:00 a 17:00 hs déjame tus duda que en la brevedad estaré respondiendo.`,
        { delay: 3000, }
    ).addAnswer(
        `Podrias indicarme tu nombre y apellido por favor. 
_Para salir del contestador responda 0_`
        , { capture: true }, async (ctx, { gotoFlow, state, flowDynamic }) => {

            clienteInfo.nombre_apellido = ctx.body;

            const myState = state?.getMyState();
            var timeoutId = myState.timeoutId;
            timeoutId = handleInactivity(state, gotoFlow);
            await state.update({ timeoutId: timeoutId });

            if (ctx.body.toLowerCase() == "0") {
                await state.update({ iniciado: false, enCurso: null });
                await flowDynamic("Gracias por comunicarte, si desea volver a generar el contestador envie !consulta")
            } else {
                await state.update({ enCurso: flowDocumento });
                return gotoFlow(flowDocumento);
            }
        });


const flowDocumento = addKeyword([EVENTS.ACTION])
    .addAnswer(
        `Me indicas tu numero de documento por favor. 
_Para salir del contestador responda 0_`
        , { capture: true }, async (ctx, { gotoFlow, state, flowDynamic }) => {

            clienteInfo.documento = ctx.body;

            const myState = state?.getMyState();
            var timeoutId = myState.timeoutId;
            timeoutId = handleInactivity(state, gotoFlow);
            await state.update({ timeoutId: timeoutId });

            if (ctx.body.toLowerCase() == "0") {
                await state.update({ iniciado: false, enCurso: null });
                await flowDynamic("Gracias por comunicarte, si desea volver a generar el contestador envie !consulta")
            } else {
                await state.update({ enCurso: flowCarrera });
                return gotoFlow(flowCarrera);
            }
        });

const flowCarrera = addKeyword([EVENTS.ACTION])
    .addAnswer(
        `Podrias indicarme de que año eres?. 
_Para salir del contestador responda 0_`
        , { capture: true }, async (ctx, { gotoFlow, state, flowDynamic }) => {

            clienteInfo.descripcion = ctx.body;

            const myState = state?.getMyState();
            var timeoutId = myState.timeoutId;
            timeoutId = handleInactivity(state, gotoFlow);
            await state.update({ timeoutId: timeoutId });

            if (ctx.body.toLowerCase() == "0") {
                await state.update({ iniciado: false, enCurso: null });
                await flowDynamic("Gracias por comunicarte, si desea volver a generar el contestador envie !consulta")
            } else {
                await state.update({ enCurso: flowItems });
                return gotoFlow(flowItems);
            }
        });

const flowItems = addKeyword([EVENTS.ACTION])
    .addAnswer(ItemsConsultas,
        {
            capture: true,
            delay: 1000,
        },
        async (ctx, { gotoFlow, fallBack, flowDynamic, state }) => {


            const myState = state?.getMyState();
            var timeoutId = myState.timeoutId;
            timeoutId = handleInactivity(state, gotoFlow);
            await state.update({ timeoutId: timeoutId });

            if (!["a", "b", "c", "d", "e", "0"].includes(ctx.body.toLowerCase())) {
                return fallBack(
                    `🔴 Respuesta no válida, por favor selecciona una de las opciones.`
                );
            }
            switch (ctx.body.toLowerCase()) {
                case "a":
                    clienteInfo.tipo = 'administrativa';
                    await state.update({ enCurso: flowFinal });
                    return gotoFlow(flowFinal);
                case "b":
                    clienteInfo.tipo = 'académica';
                    await state.update({ enCurso: flowFinal });
                    return gotoFlow(flowFinal);
                case "c":
                    clienteInfo.tipo = 'documentación';
                    await state.update({ enCurso: flowFinal });
                    return gotoFlow(flowFinal);
                case "d":
                    clienteInfo.tipo = 'inscripción';
                    await state.update({ enCurso: flowFinal });
                    return gotoFlow(flowFinal);
                case "e":
                    clienteInfo.tipo = 'otros ( favor especificar)';
                    await state.update({ enCurso: flowFinal });
                    return gotoFlow(flowFinal);
                case "0":
                    clienteInfo.tipo = '';
                    await flowDynamic("_Saliendo... Puedes volver a acceder al contestador enviando !consulta_");
                    await state.update({ iniciado: false, enCurso: null });
                    break;
            }
        }
    );


/*No se usa*/
const flowConsultas = addKeyword([EVENTS.ACTION])
    .addAnswer(ItemsConsultas, { capture: true },
        async (ctx, { gotoFlow, fallBack, state, flowDynamic }) => {

            const myState = state?.getMyState();
            var timeoutId = myState.timeoutId;
            timeoutId = handleInactivity(state, gotoFlow);
            await state.update({ timeoutId: timeoutId });

            if (!["a", "b", "c", "d", "e", "0"].includes(ctx.body.toLowerCase())) {
                return fallBack(
                    "Respuesta no válida, por favor selecciona una de las opciones."
                );
            }

            switch (ctx.body.toLowerCase()) {
                case "a":
                    await state.update({ enCurso: flowFinal });
                    return gotoFlow(flowFinal);
                case "b":
                    await state.update({ enCurso: flowFinal });
                    return gotoFlow(flowFinal);
                case "c":
                    await state.update({ enCurso: flowFinal });
                    return gotoFlow(flowFinal);
                case "d":
                    await state.update({ enCurso: flowFinal });
                    return gotoFlow(flowFinal);
                case "e":
                    await state.update({ enCurso: flowFinal });
                    return gotoFlow(flowFinal);
                case "0":
                    await state.update({ iniciado: false, enCurso: null });
                    return await flowDynamic(
                        "Saliendo... Puedes volver a acceder a este chat escribiendo !consulta"
                    );
            }
        })

const flowFinal = addKeyword([EVENTS.ACTION])
    .addAnswer('Podrias darme el detalle de tu consulta?', { capture: true }, async (ctx, { gotoFlow, fallBack, state, flowDynamic }) => {
        //const consulta = ctx.body;

        clienteInfo.consulta = ctx.body;

        const myState = state?.getMyState();
        var timeoutId = myState.timeoutId;
        timeoutId = handleInactivity(state, gotoFlow);
        await state.update({ timeoutId: timeoutId });
        await state.update({ iniciado: false, enCurso: null });
        try {
            const connection = await pool.getConnection();
            const [result] = await connection.query(
                `INSERT INTO det_consulta (nombre_apellido, documento, tipo, descripcion,numero,estado,consulta,idusuario) VALUES (?, ? ,? ,?, ?, ?, ?, ?)`,
                [clienteInfo.nombre_apellido, clienteInfo.documento, clienteInfo.tipo, clienteInfo.descripcion, ctx.from, 'Pendiente', clienteInfo.consulta, idusuario]);

            connection.release();
            console.log('Consulta almacenada en la base de datos con éxito.');
            await state.update({ iniciado: false, enCurso: null });

            await flowDynamic(`Gracias ${clienteInfo.nombre_apellido}, te respondere la duda en la brevedad posible`)
            await flowDynamic("Saludos!")
            clienteInfo = {}
        } catch (error) {
            console.error('Error al guardar el pedido en la base de datos:', error);
            await state.update({ iniciado: false, enCurso: null });
        }
    })

const flowMalla = addKeyword(EVENTS.ACTION)
    .addAnswer('Aqui te facilito la malla curricular', {
        delay: 2000,
        media: "https://imgv2-1-f.scribdassets.com/img/document/388490145/original/7e50eca805/1723633189?v=1"
    }, async (ctx, { state, gotoFlow }) => {
        const myState = state?.getMyState();
        var timeoutId = myState.timeoutId;
        timeoutId = handleInactivity(state, gotoFlow);
        await state.update({ timeoutId: timeoutId });
    })


//https://wa.me/595992756462?text=<mensaje_personalizado>


const flowAdministrativo = addKeyword([EVENTS.ACTION])
    .addAnswer('Puedes comunicarte a https://wa.me/595992756462', async (ctx, { state, gotoFlow }) => {
        const myState = state?.getMyState();
        var timeoutId = myState.timeoutId;
        timeoutId = handleInactivity(state, gotoFlow);
        await state.update({ timeoutId: timeoutId });
    })


const flowInactividad = addKeyword([EVENTS.ACTION])
    .addAnswer('Contestador cancelado por inactividad.', async (ctx,
        { state }) => {
        await state.update({ iniciado: false, enCurso: null });
    })

const main = async () => {
    /*
    const adapterDB = new MongoAdapter({
        dbUri: process.env.MONGO_DB_URI,
        dbName:"cliente001"
    })
    */

    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([
        bienvenidaFlow,
        flowFinal,
        flowConsultas,
        flowMalla,
        flowInicial,
        flowDocumento,
        flowAdministrativo,
        flowItems,
        flowInactividad,
        flowCarrera
    ])

    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    // Ruta para servir el archivo PNG del QR
    app.get('/qr', (req, res) => {
        const qrPath = path.join(__dirname, 'bot.qr.png'); // Ajusta la ruta según tu estructura de carpetas
        res.sendFile(qrPath);
    });

    app.listen(port, () => {
        console.log(`Servidor escuchando en http://localhost:${port}`);
    });

    //QRPortalWeb()
}

main()

//30 minutos timeout = 1800000
const handleInactivity = (state, gotoFlow, timeout = 1800000) => {
    console.log('Entra a handleInactivity', timeout)
    return setTimeout(async () => {
        try {
            console.log('Timeout ejecutado');
            return gotoFlow(flowInactividad);
        } catch (error) {
            console.log(error)
        }
    }, timeout);
};