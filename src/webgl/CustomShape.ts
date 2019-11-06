import {BoxGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial, Vector3} from "three";

export class CustomShape {

    private material: THREE.MeshBasicMaterial;
    public mesh: Mesh;
    private stop: boolean = false;

    constructor(private callback: () => {}){
        const cubeGeo: BoxGeometry = new BoxGeometry(3,3,3);
        this.material = new MeshBasicMaterial({color: 0xff0000});
        this.material.transparent = true;
        this.mesh = new Mesh(cubeGeo, this.material);
    }

    public update(): void {
        const value: number = 1 + Math.sin(new Date().getTime() * .015);
        // if(value < 0.1){
        //     this.stop = true
        // }
        // if(!this.stop){
        //     this.material.opacity = value;
        // } else {
        //     this.material.opacity = 0;
        // }
        this.material.opacity = value;
    }
}
