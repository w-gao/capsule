import MainMenu from "../components/MainMenu/MainMenu";
import {useCapsule} from "../contexts/CapsuleContext";
import './Home.scss'

function HomeView() {
    const {connected, error, client} = useCapsule();

    return (
        <div className="HomeView">
            <div className="HomeView__container">
                <MainMenu/>
            </div>
        </div>
    )
}

export default HomeView
