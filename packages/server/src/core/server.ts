import WebSocket from "ws";
import {v4 as uuid4} from "uuid";
import {BinaryReader, BinaryWriter} from "@capsule/common";
import { ProtocolId } from "@capsule/common";
import { Player } from "./player";
import {LobbyChannel, WorldChannel} from "./channel";


export class Server {
    private readonly players: Map<string, Player>;
    private readonly channels: Map<string, WorldChannel>;
    private readonly lobbyChannel: LobbyChannel;

    constructor() {
        this.players = new Map<string, Player>();
        this.channels = new Map<string, WorldChannel>();
        this.lobbyChannel = new LobbyChannel(this);

        // make one public world channel for people to join
        this.channels.set("default", new WorldChannel(this, "default", 1, 100));
    }

    public createChannel(mapID: number, maxPlayers: number): string {
        const uuid = uuid4().toString();
        const channel = new WorldChannel(this, uuid, mapID, maxPlayers);
        this.channels.set(uuid, channel);

        return uuid;
    }

    public switchChannel(player: Player, channelUUID: string) {
        const channel = this.channels.get(channelUUID);

        if (channel) {
            return player.joinChannel(channel);
        }
        return false;
    }

    public onPlayerConnect(uuid: string, ws: WebSocket & {uuid: string}) {
        const player = new Player(ws, this);
        this.players.set(uuid, player);

        player.joinChannel(this.lobbyChannel);
    }

    public onPlayerDisconnect(uuid: string) {
        const player = this.players.get(uuid);

        if (player === undefined) {
            console.warn("unrecognized player UUID: " + uuid);
            return;
        }

        player.disconnect();
        this.players.delete(uuid);
    }

    public onPlayerMessage(uuid: string, raw: ArrayBuffer) {
        const player = this.players.get(uuid);

        if (player === undefined) {
            console.warn("unrecognized player UUID: " + uuid);
            return;
        }

        const pk = new BinaryReader(raw);
        const id = pk.unpackByte();

        switch (id) {
            case ProtocolId.ping:
                player.handlePing(pk);
                break;
            case ProtocolId.chat:
                player.handleChat(pk);
                break;
            case ProtocolId.joinRequest:
                player.handleJoinRequest(pk);
                break;
            default:
                console.warn("received unrecognized packet: " + id);
                break;
        }
    }

    // broadcast to EVERYONE... probably not really what you want.
    public broadcast(pk: BinaryWriter) {
        this.players.forEach((player) => {
            player.sendPacket(pk);
        })
    }

}
