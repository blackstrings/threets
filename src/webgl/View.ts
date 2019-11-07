/*
 * View.ts
 * ===========
 * Topmost Three.js class. 
 * Controls scene, cam, renderer, and objects in scene.
 */

import * as THREE from "three";

import Shape from "./Shape";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {
	BoxGeometry,
	DirectionalLight,
	DirectionalLightHelper,
	GridHelper,
	Mesh, MeshBasicMaterial,
	MeshLambertMaterial,
	ShapeGeometry, Vector2,
	Vector3
} from 'three';
import {CustomShape} from "./CustomShape";
import {ShapeFactory} from '../utils/ShapeFactory';
import {Shape2D} from './Shape2D';
import {ShapeUtils} from '../utils/ShapeUtils';
import {VectorUtils} from '../utils/VectorUtils';

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
		const mesh3D: Mesh = new Mesh();
		// mesh3D is rotated by -90 degrees about the X-axis for proper OrbitControls functionality
		// mesh3D.rotation.x = -Math.PI / 2;
		this.scene.add(mesh3D);


		// test animated mesh from a custom Shape class
		//this.animatedObjs.push(new Shape(this.scene));

		// shape size and points
		const size: number = 15;
		const shapePoints: Vector2[] = [
			new Vector2(), new Vector2(0,size), new Vector2(size,size*2), new Vector2(size,0)
		];
		const shape: Shape2D = new Shape2D(shapePoints);
		this.scene.add(shape.mesh);

		// the flipped version of the shape - for visual purpose only
		const rotatedShape: Shape2D = new Shape2D(shapePoints, 0x00ff00);
		mesh3D.add(rotatedShape.mesh);

		// create the wall
		const sideIndex: number = 2;
		const wallGeo = new BoxGeometry(shape.getSideDistance(sideIndex),5,1);
		const wall = new Mesh(wallGeo, new MeshBasicMaterial({transparent: true, opacity: .5}));

		// cheap door
		const doorGeo = new BoxGeometry(2,4,1);
		const door = new Mesh(doorGeo, new MeshBasicMaterial({transparent: true, opacity: .5, color: 0x0000ff}));
		door.translateZ(1);
		wall.add(door);

		// align the wall and put into position to the side
		ShapeUtils.alignRotationWithDirection(wall, shape.getSideDirection(sideIndex));
		wall.rotateX(Math.PI / 2);
		wall.position.copy(shape.getSideCenter(sideIndex));

		// offset the wall from the side
		const offset: Vector3 = shape.getSideVectorNormal(sideIndex);
		offset.setLength(2);
		wall.position.add(offset);
		mesh3D.add(wall);


		// test static cube
		//const cube: CustomShape = new CustomShape(null);
		//this.scene.add(cube.mesh);
		//this.animatedObjs.push(cube);
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
