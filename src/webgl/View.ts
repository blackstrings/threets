/*
 * View.ts
 * ===========
 * Topmost Three.js class. 
 * Controls scene, cam, renderer, and objects in scene.
 */

import * as THREE from "three";

import Shape from "./Shape";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {BoxGeometry, DirectionalLight, DirectionalLightHelper, GridHelper, Mesh, MeshLambertMaterial, Vector3} from "three";
import {CustomShape} from "./CustomShape";

export default class View {
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private controls: OrbitControls;
	private animatedObjs: CustomShape[] = [];
	// for auto remove when animation is done
	private objsReadyForDiscard: CustomShape[] = [];

	constructor(canvasElem: HTMLCanvasElement) {
		this.sceneSetup(canvasElem);
		this.lightSetup();

		// ----------- playground code here -------------- //

		// test animated mesh from a custom Shape class
		//this.animatedObjs.push(new Shape(this.scene));

		// test static cube
		const cube: CustomShape = new CustomShape(null);
		this.scene.add(cube.mesh);
		this.animatedObjs.push(cube);
	}

	/** basic lighting for the scene */
	private lightSetup(): void {
		if(this.scene){
			const dirLight: DirectionalLight = new DirectionalLight();
			dirLight.position.set(3, 2, 1);
			dirLight.position.multiplyScalar(10);
			this.scene.add(dirLight);

			// so we can visually see the a light visual reference in the scene
			const lightHelper: DirectionalLightHelper = new DirectionalLightHelper(dirLight);
			this.scene.add(lightHelper);
		}
	}

	/** sets up basic renderer, scene, controls, etc */
	private sceneSetup(canvasElem: HTMLCanvasElement): void {
		this.renderer = new THREE.WebGLRenderer({
			canvas: canvasElem,
			antialias: true,
		});
		this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
		this.camera.position.copy(new Vector3(100,100,100));

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.TextureLoader().load("./textures/bgnd.png");

		const grid: GridHelper = new GridHelper(144, 12);
		this.scene.add(grid);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		// Set initial sizes
		this.onWindowResize(window.innerWidth, window.innerHeight);
	}

	public onWindowResize(vpW: number, vpH: number): void {
		this.renderer.setSize(vpW, vpH);
		this.camera.aspect = vpW / vpH;
		this.camera.updateProjectionMatrix();
	}

	/** main render updater */
	public update(secs: number): void {
		this.animatedObjs.forEach( obj => {
			obj.update();
		});
		//this.cleanAnimatedObjs();
		this.renderer.render(this.scene, this.camera);
	}

	private moveToDiscard(obj: CustomShape): void {
		this.objsReadyForDiscard.push(obj);
	}

	private cleanAnimatedObjs(): void {
		if(this.objsReadyForDiscard.length){
			this.objsReadyForDiscard.forEach( obj => {
				const index: number = this.animatedObjs.indexOf(obj);
				this.animatedObjs.splice(index, 1);
			});
		}
	}
}
