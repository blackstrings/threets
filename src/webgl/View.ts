/*
 * View.ts
 * ===========
 * Topmost Three.js class. 
 * Controls scene, cam, renderer, and objects in scene.
 */

import * as THREE from "three";

import Shape from "./Shape";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import TWEEN from '@tweenjs/tween.js';
import {
	AxesHelper,
	BoxGeometry,
	DirectionalLight,
	DirectionalLightHelper,
	GridHelper,
	Mesh, MeshBasicMaterial, Plane, PlaneHelper,
	Vector3,
    Quaternion
} from 'three';
import {CustomShape} from "./CustomShape";
import {SceneSample} from './SceneSample';

export default class View {
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private controls: OrbitControls;
	private animatedObjs: CustomShape[] = [];
	// for auto remove when animation is done
	private objsReadyForDiscard: CustomShape[] = [];
	private enableDebugLogs: boolean = false;

	private tween: TWEEN.Tween;

	private meshes: Mesh[] = [];
	private grid: GridHelper;

	constructor(canvasElem: HTMLCanvasElement) {
		this.enableDebugLogs = false;
		this.sceneSetup(canvasElem);
		this.lightSetup();

		// SceneSample.cameraTweenExample(this.scene, this.meshes, this.tween, this.camera);
		// SceneSample.flashCubeExample(this.scene, this.animatedObjs);
		//SceneSample.wallExample(this.scene);
		//SceneSample.clippingPlaneExample(this.scene);


		SceneSample.create4PointsAroundPointExample(this.scene);

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
		this.renderer.localClippingEnabled = true;	// for clipping planes to work
		this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
		this.camera.position.copy(new Vector3(100,100,100));

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.TextureLoader().load("./textures/bgnd.png");

		this.grid = new GridHelper(144, 12);
		this.useXYGrid();
		// this.useXZGrid();
		this.scene.add(this.grid);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		// Set initial sizes
		this.onWindowResize(window.innerWidth, window.innerHeight);
	}

	private useXYGrid(): void {
		this.grid.setRotationFromQuaternion(new Quaternion()); // reset all rotations
		this.grid.rotateX(Math.PI / 2);
	}

	private useXZGrid(): void {
		this.grid.setRotationFromQuaternion(new Quaternion()); // reset all rotations
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

		TWEEN.update();

		//this.cleanAnimatedObjs();
		this.renderer.render(this.scene, this.camera);

		if(this.enableDebugLogs) {
			console.log(`Draw calls per frame: ${this.renderer.info.render.calls}`);
		}
		this.renderer.info.autoReset = false;
		this.renderer.info.reset()
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
