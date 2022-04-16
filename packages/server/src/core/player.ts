import {BinaryReader} from "@capsule/common/dist/utils";
import WebSocket from "ws";
import {BinaryWriter, ProtocolId} from "@capsule/common";
import {Channel} from "./channel";
import {Server} from "./server";

export class Player {
    public readonly uuid: string;
    private ws: WebSocket;
    // @ts-ignore
    private server: Server;
    private channel?: Channel;

    private username?: string;

    constructor(ws: WebSocket & {uuid: string}, server: Server) {
        this.ws = ws;
        this.server = server;
        this.uuid = ws.uuid;
    }

    public joinChannel(channel: Channel): boolean {
        const status = channel.onPlayerJoin(this);

        if (status) {
            this.channel?.onPlayerLeave(this);
            this.channel = channel;
            return true;
        }
        return false;
    }

    public handlePing(pk: BinaryReader) {
        console.log("ping received - " + pk.unpackString());
        this.sendPong();
    }

    // player sent a message, broadcast it to the channel
    public handleChat(pk: BinaryReader) {
        pk.unpackString();
        const message = pk.unpackString();
        this.channel?.broadcastMessage(this.username || this.uuid, message);
    }

    public disconnect() {
    }

    public sendPong() {
        const pk = new BinaryWriter(128);
        pk.packByte(ProtocolId.pong);
        pk.packString("DATETIME");
        this.sendPacket(pk);
    }

    // types: 1 - normal, 2 - announcement
    public sendMessage(message: string, type: number) {
        const pk = new BinaryWriter(2 + message.length);
        pk.packByte(ProtocolId.chat);
        pk.packByte(type);
        pk.packString(message);
        this.sendPacket(pk);
    }

    public sendPacket(pk: BinaryWriter) {
        this.ws.send(pk.getBuffer());
    }

}
