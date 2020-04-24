import * as THREE from 'three';
import {Vector2, Vector3} from "three";

/**
 * A utility class for anything that transforms to, or works with Vectors
 *
 *
 *  VectorUtils
 */
export class VectorUtils {

	/**
	 * Converts a Vector3 to a Vector2 by taking the x and y coordinates of the Vector3
	 * and using them to create the (x,y) of the Vector2.  This gives top-down view.
	 *
	 *  {Error} when undefined/null vector passed in
	 *
	 *  {Vector3} vector3
	 *  {THREE.Vector2}
	 *
	 *  VectorUtils
	 */
	public static transformVector3ToVector2(vector3: Vector3): THREE.Vector2 {
		if(vector3) {
			return new THREE.Vector2(vector3.x, vector3.y);
		} else {
			throw new Error(`Cannot transform Vector3 to Vector2: vector is null or undefined.`);
		}
	}

	/**
	 * Converts an Array of Vector3s to an Array of Vector2s by taking the x and y coordinates of the Vector3
	 * and using them to create the (x,y) of the Vector2.  This gives top-down view.
	 *
	 *  {Error} when undefined/null vector array passed in
	 *
	 *  {Vector3[]} vector3s
	 *  {THREE.Vector2[]}
	 *
	 *  VectorUtils
	 */
	public static transformVector3sToVector2s(vector3s: Vector3[]): THREE.Vector2[] {
		let vector2s: Array<THREE.Vector2> = null;
		if(vector3s) {
			vector2s = vector3s.map((v) => {
				return VectorUtils.transformVector3ToVector2(v);
			});
		} else {
			throw new Error(`Cannot transform Vector3s to Vector2s: the vectors array is null or undefined.`);
		}
		return vector2s;
	}

	/**
	 * Converts a Vector2 to a Vector3 by adding 0 for the z value
	 *
	 * {Error} when undefined/null vector passed in
	 * param {Vector2} vector2
	 * returns {Vector3}
	 */
	public static transformVector2ToVector3(vector2: Vector2): Vector3 {
		if(vector2) {
			return new Vector3(vector2.x, vector2.y, 0);
		} else {
			throw new Error(`Cannot transform Vector2 to Vector3: vector is null or undefined.`);
		}
	}

	/**
	 * Converts an Array of Vector2s to an Array of Vector3s. Add a z value of 0 for each Vector3
	 *
	 * {Error} when undefined/null vector array passed in
	 * param {Vector2[]} vector2s
	 * returns {Vector3[]}
	 */
	public static transformVector2sToVector3s(vector2s: Vector2[]): Vector3[] {
		let vec3s: Vector3[] = [];
		if(vector2s) {
			vec3s = vector2s.map((v) => {
				return VectorUtils.transformVector2ToVector3(v);
			});
		} else {
			throw new Error(`Cannot transform Vector2s to Vector3s: the vectors array is null or undefined.`);
		}
		return vec3s;
	}

	/**
	 * Converts a JSON string to an array of vector3s.
	 * Example json coord data:
	 *  `[
	 { "x": 0, "y": 0, "z": 0 },
	 { "x": 0, "y": 144, "z": 0 },
	 { "x": 144, "y": 144, "z": 0 },
	 { "x": 144, "y": 0, "z": 0 }
	 ]`
	 *
	 *  {Error} when a null string is passed in
	 *
	 *  {string} json coordinates in json form
	 *  {Vector3[]}
	 *  VectorUtils
	 */
	public static transformStrToVector3s(json: string): Vector3[] {
		let vector3s: Vector3[] = [];
		if(json) {
			const vector3Objs = JSON.parse(json);
			vector3Objs.forEach( (vec3: Vector3) => {
				vector3s.push(new Vector3(vec3.x, vec3.y, vec3.z));
			});
		} else {
			throw new Error(`Cannot transform JSON to Vector3s: string is null or undefined.`);
		}
		return vector3s;
	}

	/**
	 * Converts a 2d number array to an array of Vector2s
	 *
	 *  {Error}
	 *
	 *  {number[][]} point2ds
	 *  {THREE.Vector2[]}
	 *  VectorUtils
	 */
	public static transform2dArrayToVector2s(point2ds: number[][]): THREE.Vector2[] {
		let vec2s: THREE.Vector2[] = null;

		if(point2ds) {
			vec2s = [];
			for(const point of point2ds) {
				vec2s.push(new THREE.Vector2(point[0], point[1]));
			}
		} else {
			throw new Error(`Cannot transform 2d array: point2ds is null.`);
		}

		return vec2s;
	}

	public static transform2dArrayToVector3s(point2ds: number[][]): Vector3[] {
		const vec2s: Vector2[] = VectorUtils.transform2dArrayToVector2s(point2ds);
		return VectorUtils.transformVector2sToVector3s(vec2s);
	}

	/**
	 * Converts a JSON string to an array of vector2s.
	 * Example json coord data:
	 *  `[
	 { "x": 0, "y": 0 },
	 { "x": 0, "y": 144 },
	 { "x": 144, "y": 144 },
	 { "x": 144, "y": 0 }
	 ]`
	 *
	 *  {Error} when a null string is passed in
	 *
	 *  {string} json coordinates in json form
	 *  {THREE.Vector2[]}
	 *  VectorUtils
	 */
	public static transformStrToVector2(json: string): THREE.Vector2[] {
		let vector2s: THREE.Vector2[] = null;
		if(json) {
			vector2s = JSON.parse(json);
		} else {
			throw new Error(`Cannot transform JSON to Vector2s: string is null or undefined.`);
		}
		return vector2s;
	}

	/**
	 * Returns the centor point (Vector3) of two Vector3s.
	 *
	 *  {Error} if null param(s) passed in
	 *
	 *  {Vector3} v1
	 *  {Vector3} v2
	 *  {Vector3}
	 *
	 *  VectorUtils
	 */
	public static getCenterPoint(v1: Vector3, v2: Vector3): Vector3 {
		let center: Vector3 = null;

		if(v1 && v2) {
			center = new Vector3();
			center.x = (v1.x + v2.x) / 2;
			center.y = (v1.y + v2.y) / 2;
			center.z = (v1.z + v2.z) / 2;
		} else {
			throw new Error(`Cannot calculate center point: one (or both) vector(s) is null.`);
		}

		return center;
	}

	/**
	 * Creates a new Vector3 by taking a focal point (as a Vector3)
	 * and modifiying it by the transform vector (as a Vector3).
	 *
	 *  {Error} if params are null
	 *
	 *  {Vector3} focalPoint Point as Vector3
	 *  {Vector3} transformVector Vector3 to transform focalPoint by
	 *  {Vector3}
	 *
	 *  VectorUtils
	 */
	public static addVectors(focalPoint: Vector3, transformVector: Vector3): Vector3 {
		let vector3: Vector3 = null;
		if(focalPoint && transformVector) {
			vector3 = new Vector3(
				(focalPoint.x + transformVector.x),
				(focalPoint.y + transformVector.y),
				(focalPoint.z + transformVector.z)
			);
		} else {
			throw new Error(`Cannot add vectors: one (or both) vector(s) is null.`);
		}
		return vector3;
	}

	/**
	 * Creates a vector from two Vector3s (as points) in the direction of the head (b).
	 * b - a = b <----- a
	 *
	 *  {Error} if params are null
	 *
	 *  {Vector3} tail tail point of the vector
	 *  {Vector3} head head point of the vector
	 *  {Vector3}
	 *
	 *  VectorUtils
	 */
	public static createVector3(tail: Vector3, head: Vector3): Vector3 {
		let vector3: Vector3 = null;
		if(tail && head) {
			vector3 = new Vector3(
				(head.x - tail.x),
				(head.y - tail.y),
				(head.z - tail.z)
			);
		} else {
			throw new Error(`Cannot create vector: one (or both) vector(s) is null.`);
		}
		return vector3;
	}

	/**
	 * The function will return TRUE if the point x,y is inside the polygon, or
	 * False if it is not. If the point is exactly on the edge of the polygon, then
	 * the function may return TRUE or FALSE.
	 *
	 * Original Author: D.Bauer, ported from Dew Framework (Java)
	 *
	 *
	 *  {(Array<THREE.Vector2> | Array<Vector3>)} vectors points in the polygon. no duplicates
	 *  {(THREE.Vector2 | Vector3)} point point to be tested
	 *  {boolean}
	 *
	 *  VectorUtils
	 */
	public static pointInPolygon(vectors: Array<THREE.Vector2> | Array<Vector3>, point: THREE.Vector2 | Vector3): boolean {
		if(vectors == null || point == null) {
			return false;
		}

		let i: number = 0;
		let j: number = vectors.length - 1;
		let oddNodes: boolean = false;

		for(i = 0; i < vectors.length; i++) {
			if((vectors[i].y < point.y && vectors[j].y >= point.y
				|| vectors[j].y < point.y && vectors[i].y >= point.y)
				&& (vectors[i].x < point.x || vectors[j].x <= point.x)) {
				if(vectors[i].x + (point.y - vectors[i].y) / (vectors[j].y - vectors[i].y) * (vectors[j].x - vectors[i].x) < point.x) {
					oddNodes = !oddNodes;
				}
			}
			j = i;
		}

		return oddNodes;
	}

	/**
	 * Returns true if point is inside the shape's 2D points.
	 * Assumes the shape points are all 2D where Z value does not exist or is not being used.
	 * If Z value does exist, it will be ignore in calculations.
	 * @param point
	 * @param shapePoints
	 */
	public static isPointInsidePoints(point: Vector3, shapePoints: Vector3[] | Vector2[]): boolean {
		let inside: boolean = false;
		if(point && VectorUtils.isXYValuesNumbers(point) && shapePoints && shapePoints.length) {
			const x: number = point.x;
			const y: number = point.y;

			for(let i = 0, j = shapePoints.length - 1; i < shapePoints.length; j = i++) {
				const xi: number = shapePoints[i].x;
				const yi: number = shapePoints[i].y;
				const xj: number = shapePoints[j].x;
				const yj: number = shapePoints[j].y;

				const intersect: boolean = ((yi > y) !== (yj > y)) &&
					(x < (xj - xi) * (y - yi) / (yj - yi) + xi);

				if(intersect) {
					inside = !inside;
				}
			}
		} else {
			console.warn('<< VectorUtils >> Failed to detect inside point, point or shapePoints is null or invalid');
		}
		return inside;
	}

	/**
	 * Returns true if point is within the shape. Assumes the point and shape is 2D where Z values are not in used.
	 * @param point
	 * @param points
	 */
	public static isPointInsideShape2D(point: Vector3, points: Vector3[]): boolean {
		if(point && points) {
			if(points && points.length > 2) {
				points = points.slice(0, points.length);	// shallow clone for saftey precaution
				return VectorUtils.isPointInsidePoints(point, points);
			} else {
				console.warn('<< VectorUtils >> Failed to detect point inside shape, shapePoints is null or empty');
			}
		} else {
			console.warn('<< VectorUtils >> Failed to detect point inside shape, point or shape is null');
		}
		return false;
	}

	/**
	 * This will return the centroid of a closed object.
	 *
	 *  {Error} if vector array is null or empty
	 *
	 *  {Array<Vector3>} vectors array of vector3s
	 *  {Vector3} a point at the center of mass
	 *
	 *  VectorUtils
	 */
	public static getCentroid(vectors: Array<Vector3>): Vector3 {
		let result: Vector3 = null;

		if(vectors && vectors.length > 0) {
			let x: number = 0;
			let y: number = 0;
			let z: number = 0;

			let points: Array<Vector3> = new Array<Vector3>();
			points = vectors.slice();
			points.push(points[0]); // because for this calc,... we need the first and last points to be the same

			let area: number = 0.0;

			const pointCount: number = points.length;

			for(let i: number = 0; i < pointCount - 1; i++) {

				const current: Vector3 = points[i];
				const next: Vector3 = points[i + 1];

				const multiplier: number = (current.x * next.y) - (next.x * current.y);

				area += multiplier;

				x += (current.x + next.x) * multiplier;
				y += (current.y + next.y) * multiplier;
				z += (current.z + next.z) * multiplier;
			}

			area = area / 2.0;

			x = x / (6.0 * area);
			y = y / (6.0 * area);
			z = z / (6.0 * area);
			result = new Vector3(x, y, z);
		} else {
			throw new Error(`Cannot get centroid: vectors is null or empty.`);
		}

		return result;
	}

	/**
	 * Sorts a list of points by their distance away from a point.
	 *
	 * Original Author: D.Bauer, ported from Dew Framework (Java)
	 *
	 *  {Error} if params are null
	 *
	 *  {Vector3} startPoint Point to compare array to
	 *  {Array<Vector3>} vector3s Array of points to be compared by distance against the startPoint
	 *  {Array<Vector3>}
	 *
	 *  VectorUtils
	 */
	public static sortArrayByDistanceFromVector(startPoint: Vector3, vector3s: Array<Vector3>): Array<Vector3> {
		let result: Array<Vector3> = null;

		if(startPoint && vector3s) {
			if(vector3s.length > 0) {
				result = new Array<Vector3>();
				const list: Array<number[]> = [];

				for(let i: number = 0; i < vector3s.length; i++) {
					const vector: Vector3 = new Vector3(
						vector3s[i].x - startPoint.x,
						vector3s[i].y - startPoint.y,
						vector3s[i].z - startPoint.z
					);
					list.push([vector3s[i].x, vector3s[i].y, vector3s[i].z, vector.length()]);
				}

				list.sort((v1, v2) => v1[3] - v2[3]);

				for(let i: number = 0; i < list.length; i++) {
					result.push(new Vector3(list[i][0], list[i][1], list[i][2]));
				}
			}
		} else {
			throw new Error(`Cannot sort vectors by distance: start point and/or array is null.`);
		}

		return result;
	}

	/**
	 * Returns the angle in degrees between two vectors. Performs calculation using only x & y components of Vector3,
	 * ignoring z.
	 *
	 *  {Error} if params null
	 *
	 *  {Vector3} p1
	 *  {Vector3} p2
	 *  {number}
	 *
	 *  VectorUtils
	 */
	public static getAngleBetweenTwoVectorsInDeg(p1: Vector3, p2: Vector3): number {
		let result: number;
		if(p1 && p2) {
			const angle1: number = Math.atan2(p1.y, p1.x);
			const angle2: number = Math.atan2(p2.y, p2.x);
			result = (angle2 - angle1) * 180 / Math.PI;
		} else {
			throw new Error(`Cannot get angle: one (or both) vector(s) is null.`);
		}
		return result;
	}

	/**
	 * Returns the angle in radians between two vectors.
	 *
	 *  {Error} if params null
	 *
	 *  {Vector3} p1
	 *  {Vector3} p2
	 *  {number}
	 *
	 *  VectorUtils
	 */
	public static getAngleBetweenTwoVectorsInRad(p1: Vector3, p2: Vector3): number {
		let result: number;
		if(p1 && p2) {
			const angle1: number = Math.atan2(p1.y, p1.x);
			const angle2: number = Math.atan2(p2.y, p2.x);
			result = (angle2 - angle1);
		} else {
			throw new Error(`Cannot get angle: one (or both) vector(s) is null.`);
		}
		return result;
	}

	/**
	 * uses a math plane to determine the intersection of a vector.
	 * returns a vector3 on plane projection (i know, it's hard to explain in text)
	 *
	 *
	 *  {Vector3} point
	 *  {Vector3} planePosition
	 *  {Vector3} planeNormal
	 *  {Vector3}
	 *
	 *  VectorUtils
	 */
	public static projectOnPlane(point: Vector3, planePosition: Vector3, planeNormal: Vector3): Vector3 {
		const dist1: number = this.distanceToPlane(point, planePosition, planeNormal);
		const offset: Vector3 = planeNormal.clone().setLength(dist1) as Vector3;
		let projection: Vector3 = point.clone().sub(offset) as Vector3;

		const dist2: number = this.distanceToPlane(projection, planePosition, planeNormal);
		if(Math.round(dist2 * 10000) / 10000 > 0) {
			projection = point.clone().add(offset) as Vector3;
		}
		return projection;
	}

	/**
	 * returns the distance from the starting point to where the plane is being projected
	 *
	 *
	 *  {any} point
	 *  {any} planePosition
	 *  {any} planeNormal
	 *  {number}
	 *
	 *  VectorUtils
	 */
	public static distanceToPlane(point: Vector3, planePosition: Vector3, planeNormal: Vector3): number {
		const dif: Vector3 = point.clone().sub(planePosition) as Vector3;
		dif.projectOnVector(planeNormal);
		const distance: number = dif.length();
		return distance;
	}

	/**
	 * Negates x and y values of passed in Vector3. z value remains unchanged
	 *
	 *  {Error} if vector is null
	 *  {Vector3} vector
	 *  {Vector3}
	 *
	 *  VectorUtils
	 */
	public static invert(vector: Vector3): Vector3 {
		let result: Vector3;
		if(vector) {
			result = new Vector3(-vector.x, -vector.y, vector.z);
		} else {
			throw new Error(`Cannot invert vector: vector is null.`);
		}
		return result;
	}

	/**
	 * checks to see if the point is contained within the shape or on the perimeter
	 *
	 *  {Error} throws an error if we can't determine if the point is inline
	 *
	 *
	 *  {Vector3[]} points points of a shape
	 *  {Vector3} point point to check
	 *  {boolean} true if yes, false if not
	 *  VectorUtils
	 */
	public static contains(points: Vector3[], point: Vector3) {
		try {
			return this.isInLine(points, point) || this.pointInPolygon(points, point);
		} catch(e) {
			throw e;
		}
	}

	/**
	 * checks to see if a point is inline with the points on the shape.  the points must be in clockwise direction
	 *
	 *  {Error} throws an error if we can't determine if the point is inline
	 *
	 *
	 *  {Vector3[]} points points of a shape
	 *  {Vector3} point point to check
	 *  {boolean} true if yes, false if not
	 *  VectorUtils
	 */
	public static isInLine(points: Vector3[], point: Vector3): boolean {
		if(!points) {
			throw new Error('Cannot determine if inline: points is null.');
		}
		if(!point) {
			throw new Error('Cannot determine if inline: point is null.');
		}

		const size = points.length;
		for(let i = 0; i < size; i++) {
			const startPoint: Vector3 = points[i];
			const endPoint: Vector3 = points[(i + 1) % size];

			try {
				if(this.isInline(startPoint, endPoint, point)) {
					return true;
				}
			} catch(e) {
				throw e;
			}
		}
		return false;
	}

	/**
	 * Checks to see if a point is between two other points making up a segment. If Point C
	 * equals Point A or Point B, isInLine will return false. Point must literally be
	 * between the two points being tested against to return true.
	 *
	 *  {Error} throws an error if we can't determine if the point is inline
	 *
	 *  {Error} for null params
	 *
	 *  {Vector3} a Point A of a segment.
	 *  {Vector3} b Point B of a segment.
	 *  {Vector3} c Point to check.
	 *  {boolean}
	 *
	 *  VectorUtils
	 */
	public static isInline(a: Vector3, b: Vector3, c: Vector3): boolean {
		let result: boolean = false;
		if(a && b && c) {
			result = Math.abs(a.distanceTo(b) - (a.distanceTo(c) + c.distanceTo(b))) < .001;
		} else {
			throw new Error(`Cannot determine if inline: vector(s) is null.`);
		}
		return result;
	}

	/**
	 * Checks to see if two vector3's are equal within an epsilon of .01
	 *
	 * throws {Error} for null params
	 * static
	 * param {Vector3} a first vector
	 * param {Vector3} b second vector
	 * param {number} [epsilon] optional, defaults to .01
	 * returns {Boolean} true if equal, false if not
	 * memberof VectorUtils
	 */
	public static equals(a: Vector3, b: Vector3, epsilon: number = .01): boolean {
		let result: boolean = false;
		if(a && b) {
			result = a.distanceToSquared(b) <= epsilon ? true : false;
		} else {
			throw new Error(`Cannot determine equality: one or more parameters null.`);
		}
		return result;
	}

	/**
	 * Compares two vector3 element arrays.
	 * Matches index against index and utilizes VectorUtils.equals with the default
	 * epislon.
	 *
	 *
	 *  {Vector3[]} aVector3s
	 *  {Vector3[]} bVector3s
	 *  {boolean}
	 *  VectorUtils
	 */
	public static arrayEquals(aVector3s: Vector3[], bVector3s: Vector3[]): boolean {
		let result: boolean = false;
		if(aVector3s && bVector3s) {
			if(aVector3s.length === bVector3s.length) {
				let arrayElementsMatch: boolean = true;
				for(let i: number = 0; i < aVector3s.length; i++) {
					if(!VectorUtils.equals(aVector3s[i], bVector3s[i])) {
						arrayElementsMatch = false;
					}
				}
				result = arrayElementsMatch;
			}
		} else if(!aVector3s && !bVector3s) {
			result = true;
		}
		return result;
	}

	/**
	 * Checks to see if two vector2's are equal within an epsilon of .01
	 *
	 *  {Error} for null params
	 *
	 *  {Vector2} a first vector
	 *  {Vector2} b second vector
	 *  {number} [epsilon] optional,  defaults to .01
	 *  {Boolean} true if equal, false if not
	 *  VectorUtils
	 */
	public static equalsVector2s(a: Vector2, b: Vector2, epsilon: number = .01): boolean {
		let result: boolean = false;
		if(a && b) {
			result = a.distanceToSquared(b) <= epsilon ? true : false;
		} else {
			throw new Error(`Cannot determine equality: one or more parameters null.`);
		}
		return result;
	}

	/**
	 * This checks current Vector3 to see if it is on an inside corner based on previous and next vectors
	 *
	 *
	 *  {Vector3} current point you want to check
	 *  {Vector3} next next point in the list
	 *  {Vector3} previous previous point in the list
	 *  {boolean} true if yes, false if not
	 *
	 *  {Error} throws an error when the parameters passed in are null
	 *
	 *  VectorUtils
	 */
	public static isPointInsideCorner(current: Vector3, next: Vector3, previous: Vector3): boolean {
		let result: boolean = false;

		if(current && next && previous) {
			const u: Vector3 = new Vector3(current.x - previous.x, current.y - previous.y, current.z - previous.z);
			const v: Vector3 = new Vector3(current.x - next.x, current.y - next.y, current.z - next.z);

			const crossProduct = v.cross(u);
			if(crossProduct.length() !== 0) {
				result = crossProduct.z >= 0;
			}
		} else {
			throw new Error(`Cannot determine if point is inside corner because one or more parameters are null`);
		}

		return result;
	}

	/**
	 * This checks current Vector3 to see if it is on an outside corner based on previous and next vectors
	 *
	 *
	 *  {Vector3} current point you want to check
	 *  {Vector3} next next point in the list
	 *  {Vector3} previous previous point in the list
	 *  {boolean} true if yes, false if not
	 *
	 *  {Error} throws an error when the parameters passed in are null
	 *
	 *  VectorUtils
	 */
	public static isPointOutsideCorner(current: Vector3, next: Vector3, previous: Vector3): boolean {
		let result: boolean = false;

		if(current && next && previous) {
			const u: Vector3 = new Vector3(current.x - previous.x, current.y - previous.y, current.z - previous.z);
			const v: Vector3 = new Vector3(current.x - next.x, current.y - next.y, current.z - next.z);

			const crossProduct = v.cross(u);
			if(crossProduct.length() !== 0) {
				result = crossProduct.z < 0;
			}
		} else {
			throw new Error(`Cannot determine if point is inside corner because one or more parameters are null`);
		}

		return result;
	}

	/**
	 * Flip a set of points horizontally from a given diverging point.
	 * Assumes the points are on the XY plane.
	 * param points the points which to flip
	 * param divergingPoint the focal point at which all points mirror/flip from
	 */
	public static flipPointsHorizontallyFromPoint(points: Vector3[], divergingPoint: Vector3): void {
		if(points && points.length) {
			if(divergingPoint && VectorUtils.isAllValuesNumbers(divergingPoint)) {

				// mirror around the Y-axis to perform a horizontal flip
				const yAxis: Vector3 = new Vector3(0, 1, 0);
				const matrix: THREE.Matrix4 = new THREE.Matrix4();
				points.forEach(p => {
					p.sub(divergingPoint);
					p.applyMatrix4(matrix.makeRotationAxis(yAxis, Math.PI));
					p.add(divergingPoint);
				});

			} else {
				throw new Error('<< VectorUtils >> Failed to rotate from point, divergingPoint is null or has invalid values');
			}
		} else {
			throw new Error('<< VectorUtils >> Failed to rotate from point, points is null or empty');
		}
	}

	/**
	 * Rotates a group of Vector3s on the XY plane, from a given point by degrees.
	 * Direct mutation will occur to the actual point references that are passed in.
	 * Assumes all points are in world space.
	 *
	 * param degree the amount of rotation, positive rotates counter clockwise while negative rotates clockwise
	 * param points the points to apply rotation to which gest mutated
	 * param pointToRotateAround the point from which to rotate around
	 * param rotationAxis the axis from which to rotate on
	 */
	public static rotatePointsFromPoint(degree: number, points: Vector3[], pointToRotateAround: Vector3, rotationAxis: Vector3): void {
		const logPrefix: string = '<< VectorUtils >> Failed to rotate from point, ';
		if(!degree) {
			throw new Error(logPrefix + 'degree is zero or invalid');
		} else {
			if(points && points.length) {
				if(pointToRotateAround && VectorUtils.isAllValuesNumbers(pointToRotateAround)) {
					if(rotationAxis && VectorUtils.hasDistanceOrDirection(rotationAxis)) {

						const angle: number = THREE.Math.degToRad(degree);
						const matrix: THREE.Matrix4 = new THREE.Matrix4();
						points.forEach(p => {
							p.sub(pointToRotateAround);
							p.applyMatrix4(matrix.makeRotationAxis(rotationAxis, angle));
							p.add(pointToRotateAround);
						});

					} else {
						throw new Error(logPrefix + 'rotationAxis is null or has no direction');
					}
				} else {
					throw new Error(logPrefix + 'pointToRotateAround is null or has invalid values');
				}
			} else {
				throw new Error(logPrefix + 'points is null or empty');
			}
		}
	}

	public static scalePointsFromPoint(scale: Vector3, points: Vector3[], pointToScaleAround: Vector3): void {
		const logPrefix: string = '<< VectorUtils >> Failed to scale from point, ';
		if(!scale) {
			throw new Error(logPrefix + 'degree is zero or invalid');
		} else {
			if(points && points.length) {
				if(pointToScaleAround && VectorUtils.isAllValuesNumbers(pointToScaleAround)) {
						const matrix: THREE.Matrix4 = new THREE.Matrix4();
						points.forEach(p => {
							p.sub(pointToScaleAround);
							p.applyMatrix4(matrix.makeScale(scale.x, scale.y, scale.z));
							p.add(pointToScaleAround);
						});

				} else {
					throw new Error(logPrefix + 'pointToScaleAround is null or has invalid values');
				}
			} else {
				throw new Error(logPrefix + 'points is null or empty');
			}
		}
	}

	public static hasDistanceOrDirection(v: Vector3): boolean {
		let result: boolean = true;
		if(!VectorUtils.isAllValuesNumbers(v)) {
			result = false;
		}
		if(result && VectorUtils.equals(v, new Vector3())) {
			result = false;
		}
		return result;
	}

	/**
	 * Returns true if all values are number values.
	 * Where zero a consider a valid number vlaue, but NaN isn't
	 * Commonly used to check for NaN values
	 */
	public static isAllValuesNumbers(v: Vector3): boolean {
		return !(Number.isNaN(v.x) || Number.isNaN(v.y) || Number.isNaN(v.z));
	}

	public static isXYValuesNumbers(v: Vector3): boolean {
		return !(Number.isNaN(v.x) || Number.isNaN(v.y));
	}

	/** assumes vector is on XY plane */
	public static rotate90CW(v: Vector3): void {
		if(v){
			v.applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
		}
	}

	/** assumes vector is on XY plane */
	public static rotate90CCW(v: Vector3): void {
		if(v){
			v.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
		}
	}

	public static getClones(points: Vector3[]): Vector3[] {
		if(points){
			const newPoints: Vector3[] = [];
			points.forEach(p => {
				newPoints.push(new Vector3(p.x, p.y, p.z));
			});
			return newPoints;
		}
		throw new Error('<< VectorUtils >> clone failed, points is null');
	}

	/**
	 * Returns the array whose XYZ values will be rounded down to the specified decimal value.
	 * Note: Use with caution! Values will be rounded and the passed in array by default will be mutated.
	 *
	 * Mainly used for debugging long floating numbers to view cleaner number values with lesser decimals.
	 *
	 * @param vecArray the array of vector3s you wish to trancate values on
	 * @param decimalPlace range from 0-10, invalid values defaults to zero
	 * @param mutateOriginal when false, the original array is cloned, only the cloned is modified and returned
	 * @throws Error when array is empty or null
	 */
	public static roundAllXyzValues(vecArray: Vector3[], decimalPlace: number = 2, mutateOriginal: boolean = true): Vector3[] {
		decimalPlace = Number.isInteger(decimalPlace) && decimalPlace > 0 && decimalPlace < 11 ? decimalPlace : 0;
		if(vecArray && vecArray.length) {

			let array: Vector3[];
			if(mutateOriginal) {
				array = vecArray;
			} else {
				array = VectorUtils.getClones(vecArray);
			}

			array = array.map(vec => {
				vec.set(
					parseFloat(vec.x.toFixed(decimalPlace)),
					parseFloat(vec.y.toFixed(decimalPlace)),
					parseFloat(vec.z.toFixed(decimalPlace))
				);
				return vec;
			});
			return array;
		}
		throw new Error('<< VectorUtils >> roundAllXyzValues failed, array is null or empty');
	}
}
