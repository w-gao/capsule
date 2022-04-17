import React, {useEffect, useRef} from "react";
import {Renderer} from "./renderer";
import './RenderContainer.scss';
import {useCapsule} from "../../contexts/CapsuleContext";


function RenderContainer() {
    const reactCanvas = useRef(null);
    const chatRef = useRef<HTMLDivElement>(null);
    const chatBoxRef = useRef<HTMLInputElement>(null);

    const {client} = useCapsule();

    useEffect(() => {
        if (!reactCanvas.current) {
            console.error('canvas is undefined')
            return;
        }

        let renderer = new Renderer(reactCanvas.current);

        if (client && chatRef.current) {
            const container = chatRef.current;

            client.newChatCallback = (type, message) => {
                console.log(type + "; " + message);

                const div = document.createElement("div");
                div.className = "chat";
                const textNode = document.createTextNode(message);
                div.appendChild(textNode);
                container.appendChild(div);
                setTimeout(() => container.removeChild(div), 10 * 1000);
            }
        }

        const sendChat = (ev: KeyboardEvent) => {
            if (chatBoxRef.current) {
                const chatBox = chatBoxRef.current;
                const message = chatBox.value;
                if (ev.keyCode === 13 && message) {
                    ev.preventDefault();
                    console.log("send message: " + message);
                    client?.sendChat(message, 1);
                    chatBox.value = "";
                }
            }
        }

        if (chatBoxRef.current) {
            chatBoxRef.current.addEventListener("keyup", sendChat);
        }

        let dispose = () => {
            console.log('unmounted');
            chatBoxRef.current?.removeEventListener("keyup", sendChat);
        }

        window.addEventListener('beforeunload', dispose);

        return dispose;
    }, [])

    return (
        <React.Fragment>
            <div ref={chatRef} className="chatContainer">
                <div className="chat">Welcome to Capsule!</div>
            </div>
            <div className="sendChatContainer">
                <input
                    ref={chatBoxRef}
                    className="chatBox"
                    placeholder="Send chat.."

                    name="msg" />
            </div>

            <canvas id="renderCanvas" ref={reactCanvas}/>
        </React.Fragment>
    );
}

export default RenderContainer;
