import express from 'express';
import cors from 'cors';
import http from "http";
import WebSocket from "ws";
import {v4 as uuid4} from"uuid";
import {VERSION} from "@capsule/common";
import {Server} from "./core/server";


const PORT = Number(process.env.PORT || 5000);

const app = express();
const server = http.createServer(app);

app.use(cors());

const capsuleServer = new Server();


const wss = new WebSocket.Server({ server: server, path: "/ws" });

wss.on('connection', (ws: (WebSocket & {uuid: string})) => {
    ws.uuid = uuid4().toString();
    capsuleServer.onPlayerConnect(ws.uuid, ws);
    console.log(`client ${ws.uuid} connected.`);

    ws.on("open", () => {
        // when is this called?
    });

    ws.on("close", () => {
        capsuleServer.onPlayerDisconnect(ws.uuid);
        console.log(`client ${ws.uuid} disconnected.`);
    });

    ws.on('message', (data: ArrayBuffer) => {
        capsuleServer.onPlayerMessage(ws.uuid, data);
    });

    ws.on('error', (err) => {
        console.log(`websocket error from ${ws.uuid}: ${err}`);
    })
});



app.get('/', (_, res) => {
    res.json({message: `Capsule - ${VERSION}`});
});

server.listen(PORT, () => {
    console.log(`Capsule server started on port ${PORT}.`);
});
