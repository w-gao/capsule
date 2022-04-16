import {useEffect, useRef} from "react";
import {Renderer} from "./renderer";
import './RenderContainer.scss';


function RenderContainer() {
    const reactCanvas = useRef(null);

    useEffect(() => {
        if (!reactCanvas.current) {
            console.error('canvas is undefined')
            return;
        }

        let renderer = new Renderer(reactCanvas.current);

        let dispose = () => {
            console.log('unmounted');
        }
        window.addEventListener('beforeunload', dispose);

        return dispose;
    }, [])

    return (
        <canvas id="renderCanvas" ref={reactCanvas}/>
    );
}

export default RenderContainer;
