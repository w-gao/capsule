import MainMenu from "../components/MainMenu/MainMenu";
import {useCapsule} from "../contexts/CapsuleContext";
import RenderContainer from "../components/Renderer/RenderContainer";
import {ReactElement} from "react";
import './Home.scss'

function HomeView() {
    const {connected, spawned, error, client} = useCapsule();

    let component: ReactElement;

    if (/* connected && */ spawned) {
        // we're spawned into a world. display the 3D scene
        component = (
                <RenderContainer/>
            )
    } else {
        // show the main menu screen
        component = (
            <div className="HomeView__container">
                <MainMenu/>
            </div>
        );
    }

    return (
        <div className="HomeView">
            {component}
        </div>
    )
}

export default HomeView
