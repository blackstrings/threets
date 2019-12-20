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
	BoxGeometry,
	DirectionalLight,
	DirectionalLightHelper, Geometry,
	GridHelper, Line, LineBasicMaterial,
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
import {LineUtils} from '../utils/LineUtils';

export default class View {
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private controls: OrbitControls;
	private animatedObjs: CustomShape[] = [];
	// for auto remove when animation is done
	private objsReadyForDiscard: CustomShape[] = [];

	private tween: TWEEN.Tween;

	private meshes: Mesh[] = [];

	constructor(canvasElem: HTMLCanvasElement) {
		this.sceneSetup(canvasElem);
		this.lightSetup();

		// ----------- playground code here -------------- //
		this.cameraTweenExample();
		//this.lineProxyScaling();
		//this.wallExample(mesh3D);
		//this.flashCubeExample();
	}

	/** on mouse click, tween the camera position and lookAt to one of the 3 spheres */
	private cameraTweenExample(): void {

		// proxy line
		this.meshes.push(ShapeFactory.createSphere(2, 8, 8, 0xff0000));
		this.meshes[0].position.set(50,0,50);
		this.meshes.push(ShapeFactory.createSphere(2, 8, 8, 0x00ff00));
		this.meshes[1].position.set(-50, 0, -50);
		this.meshes.push(ShapeFactory.createSphere(2, 8, 8, 0x0000ff));

		this.meshes.forEach(m => {
			this.scene.add(m);
		});


		let canAnimate: boolean = false;
		let counter: number = 0;
		window.addEventListener('mousedown', () => {
			if(this.tween){this.tween.stop();}
			const camDistancePadding: number = 50;
			const targetMesh: Mesh = this.meshes[counter];
			// start lookat should always be one behind the next
			const oldLookAtIndex = counter-1 < 0 ? this.meshes.length-1 : counter-1;
			const oldLookAt: Vector3 = this.meshes[oldLookAtIndex].position;
			const newMeshPos: Vector3 = targetMesh.position.clone();

			// in order to rotate the camera to lookAt the correct position,
			// we need to determine where the cam pos should be by a offset vector
			let vectorNormal: Vector3 = new Vector3(1,1);
			canAnimate = !canAnimate;
			vectorNormal.setLength(camDistancePadding);

			const newCamPos: Vector3 = newMeshPos.clone().add(vectorNormal);
			const camPosTween = this.createPositionTween(this.camera.position, newCamPos);
			camPosTween.start();

			const newLookAt: Vector3 = newMeshPos.clone();
			const camLookAtTween = this.createLookAtTween(oldLookAt.clone(), newLookAt);
			camLookAtTween.start();

			counter++;
			if(counter >= this.meshes.length){
				counter = 0;
			}
		});
	}

	/**
	 *
	 * @param targetPosition must be direct reference to the target's position
	 * @param tweenToPos the new position to tween to, can be ether clone or not
	 * @param lookAtPosition recommend cloned vector
	 */
	private createPositionTween(targetPosition: Vector3, tweenToPos: Vector3): TWEEN.Tween {
		return new TWEEN.Tween(targetPosition)
			.onUpdate(() => {
				//this.controls.target = targetPosition;
				//this.camera.lookAt(targetPosition);
			})
			.onComplete(() => {
			})
			.onStop(() => {
			})
			.to({x: tweenToPos.x, y: tweenToPos.y, z: tweenToPos.z}, 1000)
			.easing(TWEEN.Easing.Quintic.InOut);
	}

	private createLookAtTween(targetPosition: Vector3, tweenToPos: Vector3): TWEEN.Tween {
		return new TWEEN.Tween(targetPosition)
			.onUpdate(() => {
				this.camera.lookAt(targetPosition);
			})
			.onComplete(() => {
			})
			.onStop(() => {
			})
			.to({
				x: tweenToPos.x,
				y: tweenToPos.y,
				z: tweenToPos.z},
				1000)
			.easing(TWEEN.Easing.Quintic.InOut);
	}

	private lineProxyScaling(){
		const geo: Geometry = ShapeFactory.createCircleLineGeometry(2, 2, 1000);
		const mesh: Line = new Line(geo, new LineBasicMaterial({color:0xff0000}));
		this.scene.add(mesh);

		// clone the original points to proxy points
		const proxyVec3s: Vector3[] = [];
		geo.vertices.forEach( (v: Vector3) => {
			proxyVec3s.push(new Vector3(v.x, v.y, v.z));
		});

		// update
		setInterval(() => {
			// scale the proxy points
			VectorUtils.scalePointsFromPoint(new Vector3(1.1,1.1), proxyVec3s, new Vector3());
			// assign the proxy points back to the original
			for(let i=0; i<geo.vertices.length; i++) {
				geo.vertices[i].copy(proxyVec3s[i]);
			}
			// flag to update the line
			geo.verticesNeedUpdate = true;
		}, 500);
	}

	private sizingPointExample(): void {
		const vec2s: number[][] = [
			[-158.089661125933,-92.5714285714286],[-215.70541722470705,-92.5714285714286],[-277.08472384552266,-31.19212195061297],[-277.08472384552266,112.4571428571429],[-252.22776856098426,137.3140981416813],[-16.107976453954123,137.31409814168134],[51.18542830854274,70.02069337918446],[51.18542830854275,-27.428571428571427],[13.385803453751643,-27.42857142857143],[-15.760429995985653,1.7176620211658626],[-15.760429995985657,82.2857142857143],[-44.05261553655359,110.57789982628223],[-208.8463986415197,110.57789982628222],[-247.3390062204476,72.08529224735429],[-192.7339886532785,17.480274680185154],[-113.50604033521503,17.480274680185154],[-77.33358011446197,-18.69218554056791],[-77.33358011446197,-57.60000000000003],[67.57205026093199,-57.60000000000002],[67.57205026093199,26.74285714285716],[115.58518034324365,26.742857142857165],[115.58518034324365,-43.8857142857143],[81.2943078109069,-78.17658681805104],[-92.92898458565283,-78.17658681805104],[-163.57092056229155,-7.534650841412329],[-197.87196890841986,-7.534650841412329],[-217.76431857501666,-27.42700050800913],[-217.76431857501666,-52.11428571428574],[-158.089661125933,-52.11428571428574],
		];
		const vec3s: Vector3[] = VectorUtils.transform2dArrayToVector3s(vec2s);

		VectorUtils.scalePointsFromPoint(new Vector3(.5,.5,.5), vec3s, new Vector3(200,0,0));

		const geo = new Geometry();
		geo.vertices = [...vec3s];
		const line = new Line(geo, new LineBasicMaterial({color:0xff0000}));
		this.scene.add(line);
	}

	private flashCubeExample(): void {
		const cube: CustomShape = new CustomShape(null);
		this.scene.add(cube.mesh);
		this.animatedObjs.push(cube);
	}

	private wallExample(): void {
		const mesh3D: Mesh = new Mesh();
		this.scene.add(mesh3D);
		// mesh3D is rotated by -90 degrees about the X-axis for proper OrbitControls functionality
		// mesh3D.rotation.x = -Math.PI / 2;

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

		TWEEN.update();

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
