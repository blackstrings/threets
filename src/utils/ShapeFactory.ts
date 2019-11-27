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
	MeshBasicMaterial, SphereBufferGeometry
} from 'three';


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

}
