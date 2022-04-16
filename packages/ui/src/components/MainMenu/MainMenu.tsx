import logo from 'assets/logo.png';
import './MainMenu.scss'


function MainMenu() {
    return (
        <div className="MainMenu">
            <div className="MainMenu__logoContainer">
                <img src={logo} alt="logo" />
            </div>
            <div className="MainMenu__container">
            </div>
        </div>
    )
}

export default MainMenu
