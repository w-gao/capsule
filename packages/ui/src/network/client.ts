import {BinaryReader, BinaryWriter, ProtocolId, Vector3} from "@capsule/common";


export class Client {
    private readonly baseUrl: string;
    private ws?: WebSocket;

    public connected: boolean;
    public spawned: boolean;

    public disconnectCallback?: () => void;
    public spawnCallback?: () => void;
    public newChatCallback?: (type: number, message: string) => void;

    public spawnEntityCallback?: (uuid: string, location: Vector3, rotation: Vector3) => void;
    public moveEntityCallback?: (uuid: string, location: Vector3, rotation: Vector3) => void;
    public despawnEntityCallback?: (uuid: string) => void;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || "http://localhost:5000";
        this.connected = false;
        this.spawned = false;

        console.log("initialize client");
    }

    public connect(onSuccess: () => void, onError: (err: Event) => void | undefined) {
        const ws = new WebSocket(this.baseUrl + "/ws");
        ws.binaryType = 'arraybuffer';

        const that = this;
        ws.onmessage = function (msg) {
            that.handleMessage(msg);
        }

        ws.onclose = () => this.disconnect(false);
        ws.onopen = () => {
            this.connected = true;
            this.ws = ws;
            onSuccess();
        };

        ws.onerror = err => onError(err);
    }

    public disconnect(notify: boolean = false) {
        this.ws = undefined;
        this.connected = false;
        if (this.disconnectCallback) this.disconnectCallback();
    }

    public spawn(channelUUID: string) {
        this.spawned = true;
        if (this.spawnCallback) this.spawnCallback();
        if (this.newChatCallback) this.newChatCallback(2, "[system] spawned to channel: " + channelUUID);
    }

    public handleMessage(ev: MessageEvent) {
        const pk = new BinaryReader(ev.data);
        const id = pk.unpackByte();

        switch (id) {
            case ProtocolId.pong:
                console.log("[client] pong received");
                break;
            case ProtocolId.chat:
                this.handleChat(pk);
                break;
            case ProtocolId.joinResponse:
                this.handleJoinResponse(pk);
                break;
            case ProtocolId.spawnEntity:
                this.handleSpawnEntity(pk);
                break;
            case ProtocolId.moveEntity:
                this.handleMoveEntity(pk);
                break;
            case ProtocolId.despawnEntity:
                this.handleDespawnEntity(pk);
                break;
            default:
                console.warn("[client] received unrecognized packet: " + id);
                break;
        }
    }

    public handleChat(pk: BinaryReader) {
        const type = pk.unpackByte();
        const message = pk.unpackString();
        if (this.newChatCallback) this.newChatCallback(type, message);
    }

    public handleJoinResponse (pk: BinaryReader) {
        const channelUUID = pk.unpackString();
        console.log("joining " + channelUUID + "...");
        this.spawn(channelUUID);
    }

    public handleSpawnEntity(pk: BinaryReader) {
        const uuid = pk.unpackString();
        const location = pk.unpackVector3();
        const rotation = pk.unpackVector3();

        if(this.spawnEntityCallback) this.spawnEntityCallback(uuid, location, rotation);
    }

    public handleMoveEntity(pk: BinaryReader) {
        const uuid = pk.unpackString();
        const location = pk.unpackVector3();
        const rotation = pk.unpackVector3();

        if(this.moveEntityCallback) this.moveEntityCallback(uuid, location, rotation);
    }

    public handleDespawnEntity(pk: BinaryReader) {
        const uuid = pk.unpackString();

        if (this.despawnEntityCallback) this.despawnEntityCallback(uuid);
    }

    public sendPing() {
        const pk = new BinaryWriter(128);
        pk.packByte(ProtocolId.ping);
        pk.packString("~~~DATETIME~~~");
        this.sendPacket(pk);
    }

    // types: 1 - normal, 2 - announcement
    public sendChat(message: string, type: number) {  // TODO: fix the parameter order!
        // this is called sendMessage server-side, but message is used here..
        const pk = new BinaryWriter(6 + message.length);
        pk.packByte(ProtocolId.chat);
        pk.packByte(type);
        pk.packString(message);
        this.sendPacket(pk);
    }

    public sendJoinRequest(username: string, emote: number = 0) {
        const pk = new BinaryWriter(9 + username.length);
        pk.packByte(ProtocolId.joinRequest);
        pk.packString(username);
        pk.packInt(emote);
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

    private sendPacket(pk: BinaryWriter) {
        if (!this.connected || !this.ws) return;
        this.ws.send(pk.getBuffer());
    }

}
