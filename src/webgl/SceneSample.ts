import * as THREE from 'three';
import {Texture, RepeatWrapping, Vector3, ExtrudeGeometry, Scene} from 'three';
import {ShapeFactory} from '../utils/ShapeFactory';
import fs from './glsl/basicmulti.fs';
import vs from './glsl/basicmulti.vs';
import fs1 from './glsl/multilayer.fs';
import vs1 from './glsl/multilayer.vs';
import {Geometry} from 'three';
import {Mesh} from 'three';
import TWEEN from '@tweenjs/tween.js';
import {Line} from 'three';
import {LineBasicMaterial} from 'three';
import {VectorUtils} from '../utils/VectorUtils';
import {CustomShape} from './CustomShape';
import {Vector2} from 'three';
import {Shape2D} from './Shape2D';
import {BoxGeometry} from 'three';
import {MeshBasicMaterial} from 'three';
import {ShapeUtils} from '../utils/ShapeUtils';
import {Plane} from 'three';
import {PlaneHelper} from 'three';
import {AxesHelper} from 'three';

export class SceneSample {

	public static multiTextureBasicExample(scene: Scene): void {
		// let uniforms = {
		// 	colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
		// 	colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)}
		// }
		// const textureA: Texture = new THREE.TextureLoader().load("./textures/texturewood.png");
		const textureA: Texture = new THREE.TextureLoader().load("./textures/uvtexture.jpg");

		textureA.wrapS = RepeatWrapping;
		textureA.wrapT = RepeatWrapping;
		// for uvs repeat values and offset you have to update it within the shader
		// textureA.offset.set(1,1);
		// textureA.repeat.set(2, 2);
		textureA.needsUpdate = true;

		const textureB: Texture = new THREE.TextureLoader().load("./textures/texturefade.png");
		// textureB.wrapS = THREE.RepeatWrapping;
		// textureB.wrapT = THREE.RepeatWrapping;
		// textureB.repeat.set(1 / 1, 1 / 1);
		textureB.needsUpdate = true;

		let attributes = {};
		let uniforms = {
			//color: { type: "c", value: new THREE.Color( 0x0000ff ) },
			tOne: {type: 't', value: textureA},
			tSec: {type: 't', value: textureB},
			uvMultiply: {type: 'b', value: true},
			textureRepeat: {
				type: 'f',
				value: 2
			}
		}

		const size: number = 10;
		const w: number = 12;
		const l: number = 36;
		const v: Vector3[] = [
			new Vector3(), new Vector3(0,w), new Vector3(l,w), new Vector3(l,0)
		];
		const geometry: ExtrudeGeometry = ShapeFactory.createExtrudeGeometry(v, 1.5);
		//  let geometry = new THREE.BoxGeometry(size, size, size);

		let material =  new THREE.ShaderMaterial({
			uniforms: uniforms,
			fragmentShader: fs,
			vertexShader: vs,
		})

		let mesh = new THREE.Mesh(geometry, material)
		scene.add(mesh)

		// const crateTexture: Texture = new THREE.TextureLoader().load("./textures/uvtexture.jpg");
		// crateTexture.wrapS = crateTexture.wrapT = THREE.RepeatWrapping;
		// crateTexture.offset.set(1.5,1.5);
		// crateTexture.repeat.set( 2, 2 );

		var crateMaterial = new THREE.MeshBasicMaterial( { map: textureA } );
		var cubeGeometry = new THREE.BoxGeometry( 5, 5, 5 );
		var crate = new THREE.Mesh( cubeGeometry.clone(), material );
		scene.add(crate);
	}

	public static multiTextureAdvanceExample(scene: Scene): void {
		// let uniforms = {
		// 	colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
		// 	colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)}
		// }
		const textureA: Texture = new THREE.TextureLoader().load("./textures/texturewood.png");
		// const textureA: Texture = new THREE.TextureLoader().load("./textures/uvtexture.jpg");
		textureA.wrapS = THREE.RepeatWrapping;
		textureA.wrapT = THREE.RepeatWrapping;
		// textureA.repeat.set(1, 1);	// will not work with materialShader
		textureA.needsUpdate = true;
		const textureB: Texture = new THREE.TextureLoader().load("./textures/texturefade.png");
		// textureB.wrapS = THREE.RepeatWrapping;
		// textureB.wrapT = THREE.RepeatWrapping;
		// textureB.repeat.set(1 / 1, 1 / 1);
		textureB.needsUpdate = true;

		let attributes = {};

		const size: number = 10;
		const h: number = 12;
		const w: number = 128;
		let uniforms = {
			//color: { type: "c", value: new THREE.Color( 0x0000ff ) },
			texture: {type: 't', value: textureA},
			repeatX: {type: 'f', value: w},
			repeatY: {type: 'f', value: h},
			texture2: {type: 't', value: textureB},
			uvMultiply: {type: 'b', value: false},
		}


		const v: Vector3[] = [
			new Vector3(), new Vector3(0,h), new Vector3(w,h), new Vector3(w,0)
		];
		const geometry: ExtrudeGeometry = ShapeFactory.createExtrudeGeometry(v, 1.5);
		// let geometry = new THREE.BoxGeometry(size, size, size);

		let material =  new THREE.ShaderMaterial({
			uniforms: uniforms,
			fragmentShader: fs1,
			vertexShader: vs1,
		});

		for(let i=0; i<10; i++) {
			const cloneGeo: Geometry = geometry.clone();
			let mesh = new THREE.Mesh(cloneGeo, material);
			const offX: number = Math.floor( Math.random() * 1000);
			const offY: number = Math.floor( Math.random() * 1000);
			//UvUtils.offsetUVs(mesh, offX, offY);
			mesh.position.y += i * (h + .25);
			scene.add(mesh);
		}

	}

	public static meshExtrusionExample(scene): void {
		const w: number = 12;
		const v: Vector3[] = [
			new Vector3(), new Vector3(0,w), new Vector3(w,w), new Vector3(w,0)
		];
		const mesh: Mesh = ShapeFactory.createExtrudedShape(v, 1.5);
		scene.add(mesh);
	}

	/** on mouse click, tween the camera position and lookAt to one of the 3 spheres */
	public static cameraTweenExample(scene: Scene, meshes: Mesh[], tween: TWEEN.Tween, camera: THREE.PerspectiveCamera): void {

		// proxy line
		meshes.push(ShapeFactory.createSphere(2, 8, 8, 0xff0000));
		meshes[0].position.set(50,0,50);
		meshes.push(ShapeFactory.createSphere(2, 8, 8, 0x00ff00));
		meshes[1].position.set(-50, 0, -50);
		meshes.push(ShapeFactory.createSphere(2, 8, 8, 0x0000ff));

		meshes.forEach(m => {
			scene.add(m);
		});


		let canAnimate: boolean = false;
		let counter: number = 0;
		window.addEventListener('mousedown', () => {
			if(tween){tween.stop();}
			const camDistancePadding: number = 50;
			const targetMesh: Mesh = meshes[counter];
			// start lookat should always be one behind the next
			const oldLookAtIndex = counter-1 < 0 ? meshes.length-1 : counter-1;
			const oldLookAt: Vector3 = meshes[oldLookAtIndex].position;
			const newMeshPos: Vector3 = targetMesh.position.clone();

			// in order to rotate the camera to lookAt the correct position,
			// we need to determine where the cam pos should be by a offset vector
			let vectorNormal: Vector3 = new Vector3(1,1);
			canAnimate = !canAnimate;
			vectorNormal.setLength(camDistancePadding);

			const newCamPos: Vector3 = newMeshPos.clone().add(vectorNormal);
			const camPosTween = SceneSample.createPositionTween(camera.position, newCamPos);
			camPosTween.start();

			const newLookAt: Vector3 = newMeshPos.clone();
			const camLookAtTween = SceneSample.createLookAtTween(oldLookAt.clone(), newLookAt, camera);
			camLookAtTween.start();

			counter++;
			if(counter >= meshes.length){
				counter = 0;
			}
		});
	}

	/**
	 * Create position tween
	 * @param targetPosition must be direct reference to the target's position
	 * @param tweenToPos the new position to tween to, can be ether clone or not
	 * @param lookAtPosition recommend cloned vector
	 */
	public static createPositionTween(targetPosition: Vector3, tweenToPos: Vector3): TWEEN.Tween {
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

	public static createLookAtTween(targetPosition: Vector3, tweenToPos: Vector3, camera: THREE.PerspectiveCamera): TWEEN.Tween {
		return new TWEEN.Tween(targetPosition)
			.onUpdate(() => {
				camera.lookAt(targetPosition);
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

	public static lineProxyScaling(scene: Scene): void {
		const geo: Geometry = ShapeFactory.createCircleLineGeometry(2, 2, 1000);
		const mesh: Line = new Line(geo, new LineBasicMaterial({color:0xff0000}));
		scene.add(mesh);

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

	public static sizingPointExample(scene: Scene): void {
		const vec2s: number[][] = [
			[-158.089661125933,-92.5714285714286],[-215.70541722470705,-92.5714285714286],[-277.08472384552266,-31.19212195061297],[-277.08472384552266,112.4571428571429],[-252.22776856098426,137.3140981416813],[-16.107976453954123,137.31409814168134],[51.18542830854274,70.02069337918446],[51.18542830854275,-27.428571428571427],[13.385803453751643,-27.42857142857143],[-15.760429995985653,1.7176620211658626],[-15.760429995985657,82.2857142857143],[-44.05261553655359,110.57789982628223],[-208.8463986415197,110.57789982628222],[-247.3390062204476,72.08529224735429],[-192.7339886532785,17.480274680185154],[-113.50604033521503,17.480274680185154],[-77.33358011446197,-18.69218554056791],[-77.33358011446197,-57.60000000000003],[67.57205026093199,-57.60000000000002],[67.57205026093199,26.74285714285716],[115.58518034324365,26.742857142857165],[115.58518034324365,-43.8857142857143],[81.2943078109069,-78.17658681805104],[-92.92898458565283,-78.17658681805104],[-163.57092056229155,-7.534650841412329],[-197.87196890841986,-7.534650841412329],[-217.76431857501666,-27.42700050800913],[-217.76431857501666,-52.11428571428574],[-158.089661125933,-52.11428571428574],
		];
		const vec3s: Vector3[] = VectorUtils.transform2dArrayToVector3s(vec2s);

		VectorUtils.scalePointsFromPoint(new Vector3(.5,.5,.5), vec3s, new Vector3(200,0,0));

		const geo = new Geometry();
		geo.vertices = [...vec3s];
		const line = new Line(geo, new LineBasicMaterial({color:0xff0000}));
		scene.add(line);
	}

	public static flashCubeExample(scene: Scene, animatedObjs: CustomShape[]): void {
		const cube: CustomShape = new CustomShape(null);
		scene.add(cube.mesh);
		animatedObjs.push(cube);
	}

	public static wallExample(scene: Scene): void {
		const mesh3D: Mesh = new Mesh();
		scene.add(mesh3D);
		// mesh3D is rotated by -90 degrees about the X-axis for proper OrbitControls functionality
		// mesh3D.rotation.x = -Math.PI / 2;

		// shape size and points
		const size: number = 15;
		const shapePoints: Vector2[] = [
			new Vector2(), new Vector2(0,size), new Vector2(size,size*2), new Vector2(size,0)
		];
		const shape: Shape2D = new Shape2D(shapePoints);
		scene.add(shape.mesh);

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

	public static clippingPlaneExample(scene: Scene): void {
		const clip: Plane = new Plane(new Vector3(0, 1, 1), 0);
		const helper: PlaneHelper = new PlaneHelper(clip, 100, 0xff0000);
		scene.add(helper);

		const geo: BoxGeometry = new BoxGeometry(10,10,10);
		const mat: MeshBasicMaterial = new MeshBasicMaterial({color: 0x00ff00});
		const mat2: MeshBasicMaterial = new MeshBasicMaterial({color: 0x0000ff});
		mat.clippingPlanes = [clip];
		mat2.clippingPlanes = [clip];
		const mesh: Mesh = new Mesh(geo.clone(), mat);
		scene.add(mesh);

		const mesh2: Mesh = new Mesh(geo.clone(), mat2);
		mesh2.position.setY(14);
		scene.add(mesh2);

		const axis: AxesHelper = new AxesHelper(100);
		scene.add(axis);

		setInterval(() => {
			clip.constant -= 1;
		}, 1000);
	}
}
