import logo from 'assets/logo.png';
import './MainMenu.scss'
import {useCapsule} from "../../contexts/CapsuleContext";
import {useRef} from "react";


function MainMenu() {
    const {connected, client} = useCapsule();
    const usernameInputRef = useRef<HTMLInputElement>(null);

    const joinServer = () => {
        let username = "anonymous"
        if (usernameInputRef.current) {
            username = usernameInputRef.current.value;
        }

        client?.sendJoinRequest(username);
    }

    return (
        <div className="MainMenu">
            <div className="MainMenu__logoContainer">
                <img src={logo} alt="logo" />
            </div>
            <div className="MainMenu__container">
                <div className="MainMenu__serverStatusContainer">
                    <div className={"MainMenu__serverStatusIcon MainMenu__serverStatusIcon--" + (connected ? "connected" : "disconnected")}/>
                    {connected ? "connected" : "disconnected"}
                </div>
                <div className="MainMenu__usernameContainer">
                    <label htmlFor="username">username:</label>
                    <input
                        ref={usernameInputRef}
                        type="text"
                        id="username"
                        name="username"
                        maxLength={20}
                        className="MainMenu__username"
                        placeholder=""
                    />
                </div>
                <div className="MainMenu__joinServer" onClick={joinServer}>
                    JOIN
                </div>
            </div>
        </div>
    )
}

export default MainMenu
