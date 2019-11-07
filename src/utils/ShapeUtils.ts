import * as THREE from 'three';

import {Geometry, Vector3, BufferGeometry, Box3, Mesh} from "three";
import {VectorUtils} from './VectorUtils';

/**
 * Static class containing utility methods which operate on/with shapes.
 *
 *
 *  ShapeUtils
 */
export class ShapeUtils {

	// TODO JM good, maybe some shape display util
	/**
	 * By default when reading XY coordinates and drawing them into the scene
	 * they are created on the XY facing direction.
	 * If you want them facing in parallel to the ground XZ, you need to rotate them -90.
	 * This method helps perform that.
	 *  shape the shapeGeometry you want to rotate to be facing downward
	 */
	public static faceUp(shape: THREE.ShapeGeometry): void {
		this.rotateMesh(shape, -90, 0, 0);
	}

	// TODO JM good, maybe some shape display util
	/**
	 * Opposite of faceUp it rotates the planar object back to be front facing XY
	 *  shape
	 *  ShapeUtils
	 */
	public static faceFront(shape: THREE.ShapeGeometry): void {
		this.rotateMesh(shape, 90, 0, 0);
	}

	// TODO JM this may belong the object3d and shapegeom classes
	/**
	 * Basic rotator for simple rotation use. Precise rotation should use quaternions for more advance rotation.
	 * Old school rotation can be perform with obj.rotation.x = Math.PI/2;
	 *  obj
	 *  xDegree
	 *  yDegree
	 *  zDegree
	 *  ShapeUtils
	 */
	public static rotateMesh(
		obj: THREE.Object3D | THREE.ShapeGeometry,
		xDegree: number,
		yDegree: number,
		zDegree: number): void {
		obj.rotateX(THREE.Math.degToRad(xDegree));
		obj.rotateY(THREE.Math.degToRad(yDegree));
		obj.rotateZ(THREE.Math.degToRad(zDegree));
	}

	// TODO JM this should live on shapegeom class
	// TODO EPD not sure it is even useful anymore since we now use our own Geometry class
	public static scaleGeometry(geometry: THREE.Geometry | THREE.BufferGeometry, scale?: number): void {
		scale = scale || 1;
		if(geometry instanceof THREE.Geometry) {
			for(let i = 0; i < geometry.vertices.length; i++) {
				geometry.vertices[i].multiplyScalar(scale);
			}
			geometry.verticesNeedUpdate = true;
		}
	}

	public static assignUVsToPlanar(shapeGeo: THREE.ShapeGeometry): void {
		// uv setup for single plane at z coordinate 0
		// -----------------------------------------------
		// generate the bounding box for the new geometry
		// so we have a min and max size coverage we can work off from
		shapeGeo.computeBoundingBox();

		const min: THREE.Vector3 = shapeGeo.boundingBox.min;
		const max: THREE.Vector3 = shapeGeo.boundingBox.max;
		const offset: THREE.Vector2 = new THREE.Vector2(0 - min.x, 0 - min.y);
		const range = new THREE.Vector2(max.x - min.x, max.y - min.y);
		const faces: THREE.Face3[] = shapeGeo.faces;

		// each shape has a uv set located at zero
		shapeGeo.faceVertexUvs[0] = [];

		for(let i = 0; i < faces.length; i++) {

			const v1 = shapeGeo.vertices[faces[i].a],
				v2 = shapeGeo.vertices[faces[i].b],
				v3 = shapeGeo.vertices[faces[i].c];

			shapeGeo.faceVertexUvs[0].push([
				new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
				new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
				new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)
			]);
		}
		shapeGeo.uvsNeedUpdate = true;
		// ---- end of uv setup for planar
	}

	public static assignMaterialUVs(geometry: Geometry,
									profile: {width: number, height: number},
									scale?: THREE.Vector2,
									uvRotate?: boolean) {
		geometry.computeBoundingBox();
		scale = scale || new THREE.Vector2(1, 1);
		const max: THREE.Vector3 = geometry.boundingBox.max;
		const min: THREE.Vector3 = geometry.boundingBox.min;

		const offset = new Vector3(0 - min.x, 0 - min.y, 0 - min.z);
		const range = new THREE.Vector2(profile.width, profile.height);

		geometry.faceVertexUvs[0] = [];
		const faces: THREE.Face3[] = geometry.faces;
		const NX = new Vector3(1, 0, 0);
		const NY = new Vector3(0, 1, 0);
		const NZ = new Vector3(0, 0, 1);
		const ANGLE: number = Math.PI / 2;

		let ua: THREE.Vector2;
		let ub: THREE.Vector2;
		let uc: THREE.Vector2;

		for(let i = 0; i < geometry.faces.length; i++) {
			const face: THREE.Face3 = faces[i];
			const components = ['x', 'y', 'z'].sort((a, b) => Math.abs(face.normal[a]) + Math.abs(face.normal[b]));

			const v1: THREE.Vector3 = geometry.vertices[face.a];
			const v2: THREE.Vector3 = geometry.vertices[face.b];
			const v3: THREE.Vector3 = geometry.vertices[face.c];

			ua = new THREE.Vector2(0, 0);
			ub = new THREE.Vector2(0, 0);
			uc = new THREE.Vector2(0, 0);

			if(face.normal.angleTo(NY) < ANGLE || face.normal.angleTo(NY.clone().negate()) < ANGLE) {
				// top and bottom surfaces - base uvs on width and depth
				ua.set((v1.x + offset.x), (v1.z + offset.z)).divide(range).multiply(scale);
				ub.set((v2.x + offset.x), (v2.z + offset.z)).divide(range).multiply(scale);
				uc.set((v3.x + offset.x), (v3.z + offset.z)).divide(range).multiply(scale);
			} else if(face.normal.angleTo(NX) < ANGLE || face.normal.angleTo(NX.clone().negate()) < ANGLE) {
				// left and right surfaces - base uvs on depth and height
				ua.set((v1.z + offset.z), (v1.y + offset.y)).divide(range).multiply(scale);
				ub.set((v2.z + offset.z), (v2.y + offset.y)).divide(range).multiply(scale);
				uc.set((v3.z + offset.z), (v3.y + offset.y)).divide(range).multiply(scale);
			} else {
				// back and front surfaces - base uvs on width and height
				ua.set((v1.x + offset.x), (v1.y + offset.y)).divide(range).multiply(scale);
				ub.set((v2.x + offset.x), (v2.y + offset.y)).divide(range).multiply(scale);
				uc.set((v3.x + offset.x), (v3.y + offset.y)).divide(range).multiply(scale);
			}

			if(uvRotate) {
				/*
				 rotateUV(ua);
				 rotateUV(ub);
				 rotateUV(uc);
				 */
			}
			geometry.faceVertexUvs[0].push([ua, ub, uc]);
		}

		geometry.uvsNeedUpdate = true;
	}

	// TODO JM geom utils
	/**
	 * Duplicates a geometry X times and merges all dup geometries into one geometry for performance.
	 * The offset can start from the geometry's origin or from the geometry's bounding box to prevent overlapping.
	 *
	 *
	 *  {(THREE.Geometry | THREE.BufferGeometry)} geoToDuplicate
	 *  {number} duplicationAmount the number of times to dup
	 *  {number} gap the offset gap
	 *  {Vector3} [direction] optional - defaul is positive X. the direction to duplicate into.
	 *  {boolean} [useBounds] optional - default is false. If true, geometry bounds will be consider.
	 *  {THREE.Geometry}
	 *  {Error}
	 *  ShapeUtils
	 */
	public static duplicateGeoWithBoundingBox(geoToDuplicate: Geometry | BufferGeometry,
											  duplicationAmount: number, gap: number, direction: Vector3 = new Vector3(1, 0, 0),
											  useBounds: boolean = false): THREE.Geometry {

		if(geoToDuplicate) {
			const mergedGeo: Geometry = new Geometry();
			let nonBufferGeo: Geometry;

			// convert buffer to regular in order to merge geometry - can't merge buffer geos
			if(geoToDuplicate instanceof THREE.BufferGeometry) {
				nonBufferGeo = new Geometry().fromBufferGeometry(geoToDuplicate) as Geometry;
			} else {
				nonBufferGeo = geoToDuplicate as Geometry;
			}

			if(nonBufferGeo && useBounds) {
				nonBufferGeo.computeBoundingBox();
				const box: Box3 = nonBufferGeo.boundingBox;
				const width: number = box.max.x - box.min.x;
				gap += width;
			}

			// offsetDirection
			let translateOffsetDirection: THREE.Matrix4;
			let clonedDirection: Vector3;

			for(let i = 0; i < duplicationAmount; i++) {
				clonedDirection = direction.clone();                                          // get a clone
				clonedDirection.setLength(gap * i);                                           // updated the clone's
																							  // position
				translateOffsetDirection = new THREE.Matrix4().setPosition(clonedDirection);  // apply the clone
				(mergedGeo as Geometry).merge(nonBufferGeo.clone(), translateOffsetDirection);
			}

			return mergedGeo;
		}

		throw new Error('<< ShapeUtils >> Cannot duplicateGeoWithMerge: geometry to duplicate is null');
	}

	/**
	 * Duplicates a geometry X times along along a vector3 and returns a single merged geometry containing all
	 * duplicated geometries.
	 *
	 * Note: The position of the final geometry is the same position of the original geometry passed in, so the
	 * position does not changed.
	 *
	 * TODO XL Keep this method here for now although we'd like to put this method on the Geometry class
	 * - thing is not all THREEjs methods return our Geometry class, and you can't up cast any geometry into our
	 * Geometry object.
	 *
	 *
	 *  {(THREE.Geometry | THREE.BufferGeometry)} geoToDuplicate the geometry we will be duplicating on
	 *  {number} duplicationAmount the number of dups
	 *  {Vector3} vector the vector to duplicate along - can be a straight, incline, or decline slope.
	 *  {THREE.Geometry} the merged geometry from all duplicated geometries
	 *  ShapeUtils
	 */
	public static duplicateGeoAlongVector(geoToDuplicate: THREE.Geometry | THREE.BufferGeometry,
										  duplicationAmount: number, vector: Vector3): THREE.Geometry {

		if(geoToDuplicate) {
			const mergedGeo: Geometry = new Geometry();
			let nonBufferGeo: Geometry;

			// convert buffer to regular in order to merge geometry - can't merge buffer geos
			if(geoToDuplicate instanceof THREE.BufferGeometry) {
				nonBufferGeo = new Geometry().fromBufferGeometry(geoToDuplicate) as Geometry;
			} else {
				nonBufferGeo = geoToDuplicate as Geometry;
			}

			for(let i = 0; i < duplicationAmount; i++) {
				const cloneGeo: THREE.Geometry = nonBufferGeo.clone();
				cloneGeo.applyMatrix(new THREE.Matrix4().makeTranslation(i * vector.x, i * vector.y, i * vector.z));
				(mergedGeo as Geometry).merge(cloneGeo);
			}

			return mergedGeo;
		}

		throw new Error('<< ShapeUtils >> Cannot duplicateGeoWithMerge: geometry to duplicate is null');
	}

	private constructor() {
	}

	/**
	 * returns a normal for the passed in points
	 */
	public static findNormal(start: Vector3, end: Vector3): Vector3 {
		const newNormal: Vector3 = new Vector3();
		newNormal.subVectors(end.clone(), start.clone());
		newNormal.applyAxisAngle(new Vector3(0, 0, 1), THREE.Math.degToRad(90));
		newNormal.normalize();
		return newNormal;
	}

	public static alignRotationWithDirection(mesh: Mesh, direction: Vector3): void {

		if(direction) {

			if(!VectorUtils.equals(direction, new Vector3(0, 0, 0))) {

				if(Math.round(direction.x) === -1 && Math.round(direction.y) === 0) {
					// In the special case where dir.x === -1,
					// the setFromUnitVectors() method does not calculate the quaternion properly
					// so we have to set the rotation using Eular
					mesh.setRotationFromEuler(new THREE.Euler(0, 0, THREE.Math.degToRad(180)));
				} else {
					mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);
				}

			} else {
				throw new Error(`<< Mesh >> Cannot align mesh to direction, there is no direction as all xyz values are zero`);
			}
		} else {
			throw new Error(`<< Mesh >> Cannot align mesh to direction, direction is null`);
		}
	}

}
