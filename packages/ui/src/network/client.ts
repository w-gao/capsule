import {BinaryReader, BinaryWriter, ProtocolId} from "@capsule/common";


export class Client {
    private readonly baseUrl: string;
    private ws?: WebSocket;
    private connected: boolean;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || "http://localhost:5000";
        this.connected = false;

        console.log("initialize client");
    }

    public connect(onSuccess: () => void, onError: (err: Event) => void | undefined) {
        const ws = new WebSocket(this.baseUrl + "/ws");
        ws.binaryType = 'arraybuffer';
        ws.onmessage = this.handleMessage;
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
    }

    public handleMessage(ev: MessageEvent) {
        const pk = new BinaryReader(ev.data);
        const id = pk.unpackByte();

        switch (id) {
            case ProtocolId.pong:
                console.log("[client] pong received");
                break;
            default:
                console.warn("[client] received unrecognized packet: " + id);
                break;
        }
    }

    public sendPing() {
        const pk = new BinaryWriter(128);
        pk.packByte(ProtocolId.ping);
        pk.packString("~~~DATETIME~~~");
        this.sendPacket(pk);
    }

    private sendPacket(pk: BinaryWriter) {
        if (!this.connected || !this.ws) return;
        this.ws.send(pk.getBuffer());
    }

}
