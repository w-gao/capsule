import {Client} from "../network/client";
import {createContext, FC, ReactElement, useContext, useEffect, useState} from "react";

interface CapsuleContextProps {
    client?: Client;
    error: boolean;
    connected: boolean;
}

interface CapsuleProviderProps {
    baseUrl: string;
    children?: ReactElement;
}



export const CapsuleContext = createContext<CapsuleContextProps>({ error: false, connected: false });
export const useCapsule = () => useContext(CapsuleContext);

export const CapsuleProvider: FC<CapsuleProviderProps> = ({baseUrl, children}: CapsuleProviderProps) => {

    const [connected, setConnected] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [client] = useState<Client>(() => new Client(baseUrl));

    useEffect(() => {
        client.connect(() => {
            console.log("connected!");
            setConnected(true);

            client?.sendPing();
        }, err => {
            setError(true);
            console.log(err);
        });
    }, []);

    return (
        <CapsuleContext.Provider
            value={{
                client,
                error,
                connected,
            }}>
            {children}
        </CapsuleContext.Provider>
    )
}
