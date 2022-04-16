
export const ProtocolVersion = 1;


export const ProtocolId = {
    // Unconnected
    ping: 0x00,
    pong: 0x01,
    fetchServerStatus: 0x02,
    // createRequest: 0x03,
    // createResponse: 0x04,
    joinRequest: 0x05,
    joinResponse: 0x06,

    // Connected
    spawnEntity: 0x07,
    despawnEntity: 0x08,
    moveEntity: 0x09,

    disconnect: 0x10,
    chat: 0x11,

    interact: 0x12,
}
