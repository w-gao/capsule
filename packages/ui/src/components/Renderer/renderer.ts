import {
    Scene,
    Engine,
    SceneLoader,
    Vector3,
    HemisphericLight,
    FreeCamera,
    Color4,
} from "@babylonjs/core";
import "@babylonjs/loaders";

export class Renderer {
    engine: Engine;
    scene: Scene;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.createScene();

        this.buildWorld();
        this.makeController();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    private createScene(): Scene {
        const scene = new Scene(this.engine);
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        scene.onPointerDown = (evt) => {
            if (evt.button === 0) this.engine.enterPointerlock();
            if (evt.button === 1) this.engine.exitPointerlock();
        };

        scene.gravity = new Vector3(0, -9.81 / 60, 0);
        scene.collisionsEnabled = true;

        scene.clearColor = Color4.FromHexString("#cfeaffff");

        return scene;
    }

    private buildWorld() {
        SceneLoader.ImportMesh(
            "",
            "./models/",
            "map1.babylon",
            this.scene,
            (meshes => {
                console.log(meshes);

                // ground HEX: #FAE4C1

                // enable collisions for meshes
                // TODO: with complex meshes, use a child as the bounding box
                meshes.map((mesh) => {
                    if (!mesh.name.startsWith("board")) {
                        mesh.checkCollisions = true;
                    }
                });
            })
        );
    }

    private makeController(): void {
        const camera = new FreeCamera("camera", new Vector3(1, 1, -5), this.scene);
        camera.attachControl();

        camera.applyGravity = true;
        camera.checkCollisions = true;

        camera.ellipsoid = new Vector3(1, 1, 1);
        camera.minZ = 0.45;
        camera.speed = 0.75;
        camera.angularSensibility = 4000;

        // WASD
        camera.keysUp.push(87);
        camera.keysLeft.push(65);
        camera.keysDown.push(83);
        camera.keysRight.push(68);
    }
}
