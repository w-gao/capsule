import {Buffer} from "buffer";
import {byte, double, float, int, short} from "../types";


export class BinaryReader {
    public readonly buffer: Buffer;
    public offset: number;

    constructor(raw: ArrayBufferLike) {
        this.buffer = Buffer.from(raw);
        this.offset = 0;
    }

    public unreadBytes(): number {
        return Math.max(0, this.buffer.length - this.offset);
    }

    public unpack(len?: number): Uint8Array {

        if (len == undefined) {
            len = this.buffer.length;
        } else {
            len += this.offset;
        }

        if (len > this.buffer.length) {
            // return new Uint8Array([]);
            // shouldn't crash the server for this but useful for debug for now
            throw RangeError("end of packet");
        }

        const i = this.offset;
        this.offset = len;
        return this.buffer.slice(i, len);
    }

    public unpackAll(): Uint8Array {
        return this.unpack();
    }

    public unpackByte(): byte {
        const i = this.offset;
        this.offset++;
        return this.buffer[i];
    }

    public unpackByteArray(): Uint8Array {
        return this.unpack(this.unpackInt());
    }

    public unpackBoolean(): boolean {
        const i = this.offset;
        this.offset++;
        if (this.buffer[i] != 0 && this.buffer[i] != 1) console.warn('Unexpected boolean');
        return this.buffer[i] != 0;
    }

    public unpackShort(): short {
        const i = this.offset;
        this.offset += 2;
        return this.buffer.readUInt16BE(i);
    }

    public unpackSignedShort(): short {
        const i = this.offset;
        this.offset += 2;
        return this.buffer.readInt16BE(i);
    }

    public unpackInt(): int {
        const i = this.offset;
        this.offset += 4;
        return this.buffer.readInt32BE(i);
    }

    public unpackFloat(): float {
        const i = this.offset;
        this.offset += 4;
        return this.buffer.readFloatBE(i);
    }

    public unpackDouble(): double {
        const i = this.offset;
        this.offset += 8;
        return this.buffer.readDoubleBE(i);
    }

    public unpackString(): string {
        return this.unpack(this.unpackInt()).toString();
    }

    // public unpackVector3(): Vector3 {
    //
    //     return new Vector3(this.unpackLFloat(), this.unpackLFloat(), this.unpackLFloat());
    // }

}
