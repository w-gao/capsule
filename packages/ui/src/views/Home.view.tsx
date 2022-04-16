import MainMenu from "../components/MainMenu/MainMenu";
import {useCapsule} from "../contexts/CapsuleContext";
import RenderContainer from "../components/Renderer/RenderContainer";
import './Home.scss'

function HomeView() {
    const {connected, error, client} = useCapsule();

    return (
        <div className="HomeView">
            <RenderContainer />

            {/*<div className="HomeView__container">*/}
            {/*    <MainMenu/>*/}
            {/*</div>*/}
        </div>
    )
}

export default HomeView
