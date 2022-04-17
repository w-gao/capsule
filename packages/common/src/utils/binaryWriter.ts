import {Buffer} from "buffer";
import {byte, double, float, int, short} from "../types";
import {Vector3} from "./vector3";


export class BinaryWriter {
    private readonly buffer: Buffer;
    private readonly arrayBuffer: ArrayBuffer;
    private offset: number;

    constructor(size: number) {
        this.offset = 0;
        this.arrayBuffer = new ArrayBuffer(size);
        this.buffer = Buffer.from(this.arrayBuffer);
    }

    public reset(): void {
        this.offset = 0;
    }

    public getBuffer(): Uint8Array {
        return new Uint8Array(this.arrayBuffer, 0, this.offset);
    }

    public pack(value: ArrayLike<byte>): void {
        this.buffer.set(value, this.offset);
        this.offset += value.length;
    }

    public packByte(value: byte): void {
        this.buffer[this.offset] = value & 255;
        this.offset++;
    }

    public packByteArray(value: byte[]): void {
        this.packInt(value.length);
        this.pack(value);
    }

    public packBoolean(value: boolean): void {
        this.packByte(value ? 0x01 : 0x00);
    }

    public packShort(value: short): void {
        this.buffer.writeUInt16BE(value, this.offset);
        this.offset += 2;
    }

    public packSignedShort(value: short): void {
        this.buffer.writeInt16BE(value, this.offset);
        this.offset += 2;
    }

    public packInt(value: int): void {
        this.buffer.writeUInt32BE(value, this.offset);
        this.offset += 4;
    }

    public packFloat(value: float): void {
        this.buffer.writeFloatBE(value, this.offset);
        this.offset += 4;
    }

    public packDouble(value: double): void {
        this.buffer.writeDoubleBE(value, this.offset);
        this.offset += 8;
    }

    public packString(value: string): void {
        this.packInt(value.length);
        this.buffer.write(value, this.offset);
        this.offset += value.length;
    }

    public packVector3(v3: Vector3): void {
        this.packFloat(v3.x);
        this.packFloat(v3.y);
        this.packFloat(v3.z);
        this.offset += 12;
    }

}
