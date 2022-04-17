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
        this.sendMessage("Hello from server!", 2);
    }

    // player sent a message, broadcast it to the channel
    public handleChat(pk: BinaryReader) {
        pk.unpackByte();
        const message = pk.unpackString();
        this.channel?.broadcastMessage(`[${this.username || this.uuid}] ${message}`, 1);
    }

    public handleJoinRequest(pk: BinaryReader) {
        this.username = pk.unpackString();
        // const emote = pk.unpackInt();

        // also channel ID, but not going to be included in the MVP
        const channelID = "default";
        if (this.server.switchChannel(this, channelID)) {
            this.sendJoinResponse(channelID);
            return;
        }

        this.disconnect("join failed");
    }

    public disconnect(reason?: string) {
        // might want to send custom disconnect packet first
        this.ws.close(200, reason);
    }

    public sendPong() {
        const pk = new BinaryWriter(128);
        pk.packByte(ProtocolId.pong);
        pk.packString("DATETIME");
        this.sendPacket(pk);
    }

    // types: 1 - normal, 2 - system
    public sendMessage(message: string, type: number) {
        const pk = new BinaryWriter(6 + message.length);
        pk.packByte(ProtocolId.chat);
        pk.packByte(type);
        pk.packString(message);
        this.sendPacket(pk);
    }

    public sendJoinResponse(channelUUID: string) {
        const pk = new BinaryWriter(5 + channelUUID.length);
        pk.packByte(ProtocolId.joinResponse);
        pk.packString(channelUUID);
        this.sendPacket(pk);
    }

    public sendPacket(pk: BinaryWriter) {
        this.ws.send(pk.getBuffer());
    }

}
