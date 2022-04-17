import {
    Scene,
    Engine,
    SceneLoader,
    Vector3,
    HemisphericLight,
    FreeCamera,
    Color4, MeshBuilder,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import {Vector3 as Vec3} from "@capsule/common"


class RemotePlayer {
    location: Vec3;
    rotation: Vec3;
    mesh: any;

    constructor(location: Vec3, rotation: Vec3) {
        this.location = location;
        this.rotation = rotation;
    }
}

export class Renderer {
    engine: Engine;
    scene: Scene;

    private players: Map<string, RemotePlayer>;

    public updateMoveCallback?: (location: Vec3, rotation: Vec3) => void;
    private camera?: FreeCamera;
    private ticks = 0;
    private lastPosition?: Vector3;
    private lastRotation?: Vector3;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.createScene();

        this.players = new Map<string, RemotePlayer>();

        this.buildWorld();
        this.makeController();

        this.lastPosition = this.camera?.position;
        this.lastRotation = this.camera?.rotation;

        this.engine.runRenderLoop(() => {
            this.scene.render();
            this.ticks++;

            if (this.camera && this.updateMoveCallback && this.lastPosition && this.lastRotation && this.ticks % 60 == 0) {

                // if (!this.camera.position.equals(this.lastPosition) || !this.camera.rotation.equals(this.lastRotation)) {
                    this.lastPosition = this.camera?.position;
                    this.lastRotation = this.camera?.rotation;

                    this.updateMoveCallback(
                        new Vec3(this.lastPosition?.x, this.lastPosition?.y, this.lastPosition?.z),
                        new Vec3(this.lastRotation?.x, this.lastRotation?.y, this.lastRotation?.z),
                    )
                // }
            }
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

        this.camera = camera;
    }

    public spawnEntity(uuid: string, location: Vec3, rotation: Vec3) {
        const player = new RemotePlayer(location, rotation);
        this.players.set(uuid, player);

        const mesh = MeshBuilder.CreateBox(uuid, {
            width: 1,
            height: 1
        }, this.scene);

        mesh.position = new Vector3(location.x, location.y, location.z);
        mesh.rotation = new Vector3(rotation.x, rotation.y, rotation.z);
        player.mesh = mesh;
    }

    public moveEntity(uuid: string, location: Vec3, rotation: Vec3) {
        const player = this.players.get(uuid);
        if (!player) return;

        player.mesh.position = new Vector3(location.x, location.y, location.z);
        player.mesh.rotation = new Vector3(rotation.x, rotation.y, rotation.z);
    }

    public despawnEntity(uuid: string) {
        const player = this.players.get(uuid);
        if (!player) return;
        player.mesh.dispose();
        this.players.delete(uuid);
    }
}
