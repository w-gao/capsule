import {Player} from "./player";
import {Server} from "./server";
import {BinaryWriter, ProtocolId} from "@capsule/common";


// Contains a group of players. Useful for broadcasting messages for a particular group of people.
export abstract class Channel {
    protected server: Server;
    protected players: Map<string, Player>;

    constructor(server: Server) {
        this.server = server;
        this.players = new Map<string, Player>();
    }

    public onPlayerJoin(player: Player): boolean {
        this.players.set(player.uuid, player);
        return true;
    }

    public onPlayerLeave(player: Player): void {
        this.players.delete(player.uuid);
    }


    public broadcast(pk: BinaryWriter) {
        this.players.forEach((player) => {
            player.sendPacket(pk);
        })
    }

    public broadcastMessage(source: string, message: string) {
        const pk = new BinaryWriter(1 + source.length + message.length);
        pk.packByte(ProtocolId.chat);
        pk.packString(source);
        pk.packString(message);
        this.broadcast(pk);
    }
}

export class LobbyChannel extends Channel {


}

export class WorldChannel extends Channel {
    // @ts-ignore
    private uuid: string;
    // @ts-ignore
    private mapID: number;
    private maxPlayers: number;

    constructor(server: Server, uuid: string, mapID: number, maxPlayers: number) {
        super(server);
        this.uuid = uuid;
        this.mapID = mapID;
        this.maxPlayers = maxPlayers;
    }

    public onPlayerJoin(player: Player): boolean {
        if (this.players.size >= this.maxPlayers) {
            player.sendMessage("[system] This room is full! Please try again later.", 2);
            return false;
        }

        return super.onPlayerJoin(player);
    }
}
