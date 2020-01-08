import * as THREE from 'three';
// three plugins

import {VectorUtils} from './VectorUtils';
import {ShapeUtils} from './ShapeUtils';

import {
	Geometry,
	BoxGeometry,
	DirectionalLight,
	DirectionalLightHelper,
	GridHelper,
	Mesh,
	MeshLambertMaterial,
	Vector3,
	MeshBasicMaterial, SphereBufferGeometry, Line,
	AxesHelper, ExtrudeGeometry
} from 'three';
import { UvUtils } from './UvUtils';


/**
 * Can create THREE.Geometry, and Mesh
 */
export module ShapeFactory {

	export function create2dGeometry(point2ds: THREE.Vector2[]): THREE.ShapeGeometry {
		const threeShape: THREE.Shape = new THREE.Shape(point2ds);
		return new THREE.ShapeGeometry(threeShape);
	}

	export function create2dGeometryFromVec3s(vec3s: Vector3[]): THREE.ShapeGeometry {
		let point2ds: THREE.Vector2[] = [];
		if(vec3s) {
			if(vec3s.length) {
				try {
					point2ds = VectorUtils.transformVector3sToVector2s(vec3s);
				} catch(error) {
					throw (error);
				}
				return this.create2dGeometry(point2ds);
			} else {
				throw new Error('<< ShapeFactory >> Cannot create 2d geometry, vec3s has a length of zero');
			}
		} else {
			throw new Error('<< ShapeFactory >> Cannot create 2d geometry, vec3s is null');
		}
	}

	/**
	 * Cretes a 2d geometry from 2d arrays.
	 */
	export function create2dGeometryFrom2dArray(point2ds: number[][]): THREE.ShapeGeometry {
		let vec2s: THREE.Vector2[];
		try {
			vec2s = VectorUtils.transform2dArrayToVector2s(point2ds);
		} catch(error) {
			throw (error);
		}
		if(vec2s) {
			return create2dGeometry(vec2s);
		}
		throw new Error('Cannot create 2d geometry from 2dArray, vec2s is null');
	}

	// TODO loads a obj (geometry) or mesh form externally from a file and return it
	export function load(filePath: string): THREE.Geometry {
		console.log('Method not implmemented.');
		return null;
	}

	/**
	 * Creates a set of 2D points that are offset by padding
	 *
	 * param {number} padding
	 * param {Vector2[]} contour
	 * returns {Vector2[]}
	 */
	export function offsetContour(padding: number, contour: THREE.Vector2[]): THREE.Vector2[] {
		const result: THREE.Vector2[] = [];
		const offset: THREE.BufferAttribute = new THREE.BufferAttribute(new Float32Array([-padding, 0, 0]), 3);
		for(let i = 0; i < contour.length; i++) {
			const v1: THREE.Vector2 = new THREE.Vector2().subVectors(contour[i - 1 < 0 ? contour.length - 1 : i - 1], contour[i]);
			const v2: THREE.Vector2 = new THREE.Vector2().subVectors(contour[i + 1 == contour.length ? 0 : i + 1], contour[i]);
			const angle: number = v2.angle() - v1.angle();
			const halfAngle: number = angle * 0.5;
			const hA: number = halfAngle;
			const tA: number = v2.angle() + Math.PI * 0.5;
			const shift: number = Math.tan(hA - Math.PI * 0.5);
			const shiftMatrix: THREE.Matrix4 = new THREE.Matrix4().set(
				1, 0, 0, 0,
				-shift, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			);
			const tempAngle: number = tA;
			const rotationMatrix: THREE.Matrix4 = new THREE.Matrix4().set(
				Math.cos(tempAngle), -Math.sin(tempAngle), 0, 0,
				Math.sin(tempAngle), Math.cos(tempAngle), 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			);
			const translationMatrix: THREE.Matrix4 = new THREE.Matrix4().set(
				1, 0, 0, contour[i].x,
				0, 1, 0, contour[i].y,
				0, 0, 1, 0,
				0, 0, 0, 1
			);
			const cloneOffset: THREE.BufferAttribute = offset.clone();
			shiftMatrix.applyToBuffer(cloneOffset);
			rotationMatrix.applyToBuffer(cloneOffset);
			translationMatrix.applyToBuffer(cloneOffset);
			result.push(new THREE.Vector2(cloneOffset.getX(0), cloneOffset.getY(0)));
		}
		result.push(result[0].clone());
		return result;
	}

	/**
	 * Creates a contour shape with a thickness of offset using the passed in contourPoints
	 *
	 * @param offset
	 * @param contourPoints
	 */
	export function completeContour(offset: number, contourPoints: Vector3[]): Vector3[] {
		const shapePoints: Vector3[] = [];
		const finalShapePoints: Vector3[] = [];
		const normals: Vector3[] = [];

		// Create normals relevant to each point
		for(let i = 0; i < contourPoints.length; i++) {
			if(i === 0) {
				// First point - normal from first point to second point
				normals.push(ShapeUtils.findNormal(contourPoints[i], contourPoints[i + 1]));
			} else if(!(i === contourPoints.length - 1)) {
				// Between points - normal from previous point to next point
				normals.push(ShapeUtils.findNormal(contourPoints[i - 1], contourPoints[i + 1]));
			} else {
				// End Point - normal from previous point to end point
				normals.push(ShapeUtils.findNormal(contourPoints[i - 1], contourPoints[i]));
			}
			shapePoints.push(contourPoints[i]);
		}

		// starting from the end, use normals to project the offset point from the contour point
		for(let i = contourPoints.length - 1; i >= 0; i--) {
			let clonePoint: Vector3 = new Vector3().copy(contourPoints[i]);
			let normal: Vector3 = normals[i].clone();
			normal.multiplyScalar(offset);
			shapePoints.push(VectorUtils.addVectors(clonePoint, normal));
			// if the contour point is in the same position as the next contour point, we're probably at a side junction
			if(i < contourPoints.length - 1 && i - 2 >= 0 && VectorUtils.equals(contourPoints[i], contourPoints[i - 1], 0.001)) {
				// Remember, we're itterating backwards here...
				clonePoint = new Vector3().copy(contourPoints[i]);
				normal = normals[i].clone();
				const normal2: Vector3 = normals[i - 1].clone();
				normal = VectorUtils.addVectors(normal, normal2);
				normal.normalize();
				const angle: number = Math.abs( VectorUtils.getAngleBetweenTwoVectorsInDeg(normal, normal2));
				// If we're making a 90 degree turn
				if(Math.abs(angle) >= 40 && Math.abs(angle) <= 50) {
					shapePoints.pop(); // Remove the previously projected point because we're replacing it
					// Calculate the correct projection length
					const ratio: number = angle / 45.0;
					const scale: number = (ratio > 1 ? ratio - (ratio - 1) : ratio) * Math.sqrt(2);
					const newOffset: number = offset * scale;
					normal.multiplyScalar(newOffset);
					shapePoints.push(VectorUtils.addVectors(clonePoint, normal));
					// Skip the next contour point
					i--;
				}
			}
		}

		// Drop neighboring duplicates (that were used to denote junction between two sides)
		for(const point of shapePoints) {
			if(!finalShapePoints.length) {
				finalShapePoints.push(point);
			} else if(finalShapePoints.length && !VectorUtils.equals(point,finalShapePoints[finalShapePoints.length - 1], 0.001)) {
				finalShapePoints.push(point);
			}
		}

		return finalShapePoints;
	}

	/** returns points on an arc like path. It is also possible to get points forming a full circle. */
	export function getPointsOnArc(
		radius: number,
		segments: number = 12,
		startTheta: number = 0,
		endTheta: number = Math.PI * 2,
		clockwise: boolean = false
	): Vector3[] {

		const arcShape: THREE.Shape = new THREE.Shape();
		arcShape.absarc(0, 0, radius, startTheta, endTheta, clockwise);

		const points: Vector3[] = [];
		arcShape.getPoints(segments).forEach(p => {
			points.push(new Vector3(p.x, p.y));
		});
		return points;
	}

	/** returns points in the shape of a perfect circle or ellipse */
	export function getPointsOnCircle(
		radiusX: number,
		radiusY: number,
		segments: number = 12,
		startAngle: number = 0,
		endAngle = Math.PI * 2,
		clockwise: boolean = true
	): Vector3[] {

		const circ: THREE.EllipseCurve = new THREE.EllipseCurve(0, 0, radiusX, radiusY, startAngle, endAngle, clockwise, 0);
		const circPoints: Vector3[] = [];
		circ.getPoints(segments).forEach(p => {
			circPoints.push(new Vector3(p.x, p.y));
		});
		return circPoints;
	}

	/** returns a geometry containing vectors that make up a circle. Good for creating Line meshes */
	export function createCircleLineGeometry(
		radiusX: number,
		radiusY: number,
		segments: number = 12,
		startAngle: number = 0,
		endAngle = Math.PI * 2,
		clockwise: boolean = true
	): Geometry {

		const circPoints: Vector3[] = ShapeFactory.getPointsOnCircle(radiusX, radiusY, segments, startAngle, endAngle, clockwise);
		const circGeo: Geometry = new Geometry();
		circGeo.vertices.push(...circPoints);
		return circGeo;
	}

	export function createSphere(rad: number = 1, vSeg: number = 8, hSeg: number = 8, color: number = 0xff0000): Mesh {
		const geo = new SphereBufferGeometry(rad, hSeg, vSeg);
		const mesh = new Mesh(geo, new MeshBasicMaterial({color: color}))
		return mesh;
	}

	/**
	 * FreezeTransformation only works on meshes that have been moved or rotated through applyMatrix().
	 * Manipulating the mesh by setting position and rotation without using the matrix will not have desireable outcome
	 * with this method.
	 *
	 * Resets the objet3d's matrix to the unity value, but does not move the object3d from its currently location it is
	 * at. Whether or not the mesh has modified position, rotation, or scale, keep the current state, but reset the
	 * values.
	 *
	 * It tells the mesh
	 * - its current position becomes its origin, as if it has never been translated.
	 * - its rotations are zeroed out, as if it has never been rotated.
	 * - its scale is set to 1,1,1 as if it has never been scaled.
	 *
	 * For those that understand matrix, the mesh's matrix4 is reset to the matrix unity value.
	 *
	 *  Mesh
	 */
	export function freezeTransformation(object3d: Line | Mesh): void {

		object3d.geometry.applyMatrix(object3d.matrix);
		object3d.position.set(0, 0, 0);
		object3d.rotation.set(0, 0, 0);
		object3d.scale.set(1, 1, 1);
		object3d.updateMatrix();

	}

	/**
	 * Returns a Line 3d object for the scene. By default the line does not auto close.
	 * To make a closed line, clone the start point and push it into the array as last element.
	 *
	 * param points the points which forms the line
	 * param color a hex number in format of (0xff0000) by default will be red if not provided
	 */
	export function createDebugLine(points: Vector3[], color: number = 0xff0000): Line {
		if(points && points.length) {
			const geo: THREE.Geometry = new THREE.Geometry();
			geo.vertices.push(...points);
			return new Line(geo, new THREE.LineBasicMaterial({color: color}));
		} else {
			throw new Error('<< Object3dUtils >> Failed to create debug Line, points is null or empty');
		}
	}

	/**
	 * Returns a visual helper that displays XYZ axis. Only use for debugging purposes.
	 *
	 * Useful for visually marking a point in 3d space and showing 3d direction.
	 * When rotating a mesh, useful to visually see where its original axis are pointing.
	 *
	 *
	 *  {number} [size=5] size of the axis
	 *  {THREE.AxisHelper} the axis itself
	 *  Object3dUtils
	 */
	export function createAxes(size: number = 5): AxesHelper {
		return new AxesHelper(size);
	}

	/**
	 * Create and returns a rectangle board mesh from a XY Plane facing direction.
	 *
	 * This method uses the points passed in to create the Mesh3D of the object. It does so by creating the six planes
	 * of the object individually, as though the FramingComponent is oriented in the positive x-axis, then rotating and
	 * translating these planes as necessary, and finally merging them into a single Geometry. By using this method, we
	 * can maintain better control of the UV's of the object
	 *
	 * Used for creating box like shapes, especially for plotted boards.
	 * The creation process expects exactly Eight vector3 points.
	 *
	 * Position yourself looking at a piece of paper and drawing out a rectangle. That first face is the top side of
	 * the box.
	 *
	 * Where point indices 0-3 representing the top layer.
	 * Where 4-7 representing the bottom layer.
	 * Where 4,0,3,7 represent the right side
	 * Where 5,1,2,6 represents the left side.
	 *
	 *   6__________7
	 *  /|         /|
	 * 2----------3 |
	 * | 5_  _  _  _| 4
	 * 1/_________0/
	 *
	 *
	 *  {Vector3[]} points the 8 points to create the box
	 *  {THREE.Material} material the material of the box
	 *  {Mesh} the returned box mesh
	 *  Object3dUtils
	 */
	export function createBoardMesh3D(points: Vector3[], material: THREE.Material): Mesh {
		const length: number = points[0].distanceTo(points[1]); // represents the longest dimension of the board
		const width: number = points[1].distanceTo(points[2]);
		const thickness: number = points[0].distanceTo(points[4]);

		const matrix: THREE.Matrix4 = new THREE.Matrix4(); // Unit matrix which will be used to apply transformations
														   // to the various Geometries we create

		// sidePlane1Vec2s - used to create the PlaneGeometry for the first side and third (top & bottom)
		const sidePlane1Vec2s: THREE.Vector2[] = [
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, width),
			new THREE.Vector2(length, width),
			new THREE.Vector2(length, 0)
		];

		const sidePlane1: THREE.ShapeGeometry = this.createBoardPlaneGeometry(sidePlane1Vec2s, 0); // represents the
																								   // top of the
																								   // framing component
																								   // (positive z-axis
																								   // facing)

		const sidePlane3: THREE.ShapeGeometry = sidePlane1.clone(); // represents the bottom of the framing component
																	// (negative z-axis facing)
		sidePlane3.applyMatrix(matrix.makeRotationX(THREE.Math.degToRad(180)));
		sidePlane3.applyMatrix(matrix.makeTranslation(0, width, -thickness));

		// sidePlane2Vec2s - used to create the PlaneGeometry for the second and fourth sides (left & right sides)
		const sidePlane2Vec2s: THREE.Vector2[] = [
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, thickness),
			new THREE.Vector2(length, thickness),
			new THREE.Vector2(length, 0)
		];

		const sidePlane2: THREE.ShapeGeometry = this.createBoardPlaneGeometry(sidePlane2Vec2s, 0); // represents the
																								   // 'back' side of
																								   // the framing
																								   // component
																								   // (positive y-axis
																								   // facing)

		const sidePlane4: THREE.ShapeGeometry = sidePlane2.clone(); // represents the 'front' side of the framing
																	// component (negative y-axis facing)

		// Here we apply the necessary rotation and transformation to place sidePlane2
		sidePlane2.applyMatrix(matrix.makeRotationX(THREE.Math.degToRad(-90)));
		sidePlane2.applyMatrix(matrix.makeTranslation(0, width, 0));

		// And now applying the necessary rotation to place sidePlane4
		sidePlane4.applyMatrix(matrix.makeRotationX(THREE.Math.degToRad(-90)));

		// endPlaneVecs - THREE.Vector2s used to create the PlaneGeometry for the end sides of the board
		const endPlaneVecs: THREE.Vector2[] = [
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, width),
			new THREE.Vector2(thickness, width),
			new THREE.Vector2(thickness, 0)
		];

		const endPlane1: THREE.ShapeGeometry = this.createBoardPlaneGeometry(endPlaneVecs, 90); // represents the right
																								// side of the framing
																								// component (positive
																								// x-axis facing)
		// Before cloning, we rotate the endPlane through the Y planes
		endPlane1.applyMatrix(matrix.makeRotationY(THREE.Math.degToRad(90)));

		const endPlane2: THREE.ShapeGeometry = endPlane1.clone(); // represents the left side of the framing component
																  // (negative x-axis facing)

		endPlane1.applyMatrix(matrix.makeTranslation(length, 0, 0));

		// flip side4 and end2 normals
		UvUtils.flipFaceNormalOnGeo(sidePlane4);
		UvUtils.flipFaceNormalOnGeo(endPlane2);

		// Here we merge the individual Plane Geometries into a single Geometry to create the mesh3D
		const boardGeo: THREE.Geometry = new THREE.Geometry();
		boardGeo.merge(sidePlane1);
		boardGeo.merge(sidePlane2);
		boardGeo.merge(sidePlane3);
		boardGeo.merge(sidePlane4);
		boardGeo.merge(endPlane1);
		boardGeo.merge(endPlane2);

		boardGeo.mergeVertices(); // removes duplicate vertices from the Geometry

		return new Mesh(boardGeo, material);
	}

	/**
	 * Creates a plane Geometry for a board face
	 *
	 *
	 *  {THREE.Vector2[]} points
	 *  {number} textureRotateDegree
	 *  {THREE.ShapeGeometry}
	 *  FramingComponent
	 */
	export function createBoardPlaneGeometry(points: THREE.Vector2[], textureRotateDegree: number): THREE.ShapeGeometry {
		const shape: THREE.Shape = new THREE.Shape(points);
		const geo: THREE.ShapeGeometry = new THREE.ShapeGeometry(shape);
		UvUtils.setUvRotationOnGeometry(textureRotateDegree, geo);
		return geo;
	}

	export function createExtrudeGeometry(
		points: Vector3[],
		extrudeAmount = 0,
		isBevel: boolean = true,
		bevelSegments: number = 1,
		steps: number = 0,
		bevelSize: number = 0,
		bevelThickness: number = 0
	): ExtrudeGeometry {
		if(points && points.length) {

			// Note: there are no type saftey for extrude settings
			// geo extrusion settings - high chance these values will be constant once finalize
			const extrudeSettings: Object = {
				amount: extrudeAmount,
				bevelEnabled: isBevel,
				bevelSegments: bevelSegments,
				steps: steps,
				bevelSize: bevelSize,
				bevelThickness: bevelThickness
			};

			try { // Use THREE.ExtrudeGeometry to create floorMesh3D
				const point2ds: THREE.Vector2[] = VectorUtils.transformVector3sToVector2s(points);
				const shape: THREE.Shape = new THREE.Shape(point2ds);
				const extrudedGeometry: THREE.ExtrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
				return extrudedGeometry;
			} catch (e) {
				throw new Error(e);
			}
		}
	}

	/**
	 * creates an extruded mesh out from 2d points. Assumes the 2d points are on the same place.
	 * Note: bevelSegments is req to be 1 or higher to see any extrusion.
	 */
	export function createExtrudedShape(
		points: Vector3[],
		extrudeAmount = 0,
		isBevel: boolean = true,
		bevelSegments: number = 1,
		steps: number = 0,
		bevelSize: number = 0,
		bevelThickness: number = 0): Mesh
	{
		if(points && points.length) {

			try{
				const extrudedGeometry: ExtrudeGeometry = ShapeFactory.createExtrudeGeometry(
					points, extrudeAmount, isBevel, bevelSegments,steps, bevelSize, bevelThickness);

				const mesh: Mesh = new Mesh(extrudedGeometry);
				return mesh;
			} catch(e) {
				throw new Error(e);
			}

		} else {
			throw new Error('<< Object3dUtils >> Failed to create extruded mesh, points is null or empty');
		}
	}

}
