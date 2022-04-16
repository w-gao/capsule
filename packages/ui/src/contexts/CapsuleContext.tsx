import {Client} from "../network/client";
import {createContext, FC, ReactElement, useContext, useEffect, useState} from "react";

interface CapsuleContextProps {
    client?: Client;
    error: boolean;
    connected: boolean;
    spawned: boolean;
}

interface CapsuleProviderProps {
    baseUrl: string;
    children?: ReactElement;
}


export const CapsuleContext = createContext<CapsuleContextProps>({ error: false, connected: false, spawned: false });
export const useCapsule = () => useContext(CapsuleContext);

export const CapsuleProvider: FC<CapsuleProviderProps> = ({baseUrl, children}: CapsuleProviderProps) => {

    const [connected, setConnected] = useState<boolean>(false);
    const [spawned, setSpawned] = useState<boolean>(false);

    const [error, setError] = useState<boolean>(false);
    const [client] = useState<Client>(() => new Client(baseUrl));

    const pingServer = () => {
        if (!client.connected) {
            setConnected(false);
            client.connect(() => {
                setConnected(true);
            }, () => {
            });
        }
        client.sendPing();
    }

    useEffect(() => {
        client.connect(() => {
            console.log("connected!");
            setConnected(true);

            // ping the server once in a while to see if we're still online
            setInterval(pingServer, 5000);

        }, err => {
            setError(true);
            console.log(err);
        });

        // hook into client's spawn event
        // TODO: implement event system in the future
        client.spawnCallback = () => setSpawned(client.spawned);

    }, []);

    return (
        <CapsuleContext.Provider
            value={{
                client,
                error,
                connected,
                spawned
            }}>
            {children}
        </CapsuleContext.Provider>
    )
}
