import {BinaryReader} from "@capsule/common/dist/utils";
import WebSocket from "ws";
import {BinaryWriter, ProtocolId, Vector3} from "@capsule/common";
import {Channel} from "./channel";
import {Server} from "./server";

export class Player {
    public readonly uuid: string;
    private ws: WebSocket;
    // @ts-ignore
    private server: Server;
    private channel?: Channel;

    private username?: string;
    public location: Vector3;
    public rotation: Vector3;

    constructor(ws: WebSocket & {uuid: string}, server: Server) {
        this.ws = ws;
        this.server = server;
        this.uuid = ws.uuid;

        this.location = new Vector3(0, 0, 0);
        this.rotation = new Vector3(0, 0, 0);
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
        pk.unpackByte();  // assume chat
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
            this.channel?.spawnEntities(this);
            return;
        }

        this.disconnect("join failed");
    }

    public handleMoveEntity(pk: BinaryReader) {
        pk.unpackString();   // uuid
        const location = pk.unpackVector3();
        const rotation = pk.unpackVector3();

        this.location = location;
        this.rotation = rotation;

        // broadcast move
        this.channel?.moveEntity(this);
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

    public sendSpawnEntity(uuid: string, location: Vector3, rotation: Vector3) {
        const pk = new BinaryWriter(29 + uuid.length + 30);
        pk.packByte(ProtocolId.spawnEntity);
        pk.packString(uuid);
        pk.packVector3(location);
        pk.packVector3(rotation);
        this.sendPacket(pk);
    }

    public sendMoveEntity(uuid: string, location: Vector3, rotation: Vector3) {
        const pk = new BinaryWriter(29 + uuid.length + 30);
        pk.packByte(ProtocolId.moveEntity);
        pk.packString(uuid);
        pk.packVector3(location);
        pk.packVector3(rotation);
        this.sendPacket(pk);
    }

    public sendDespawnEntity(uuid: string) {
        const pk = new BinaryWriter(5 + uuid.length);
        pk.packByte(ProtocolId.despawnEntity);
        pk.packString(uuid);
        this.sendPacket(pk);
    }

    public sendPacket(pk: BinaryWriter) {
        this.ws.send(pk.getBuffer());
    }

}
