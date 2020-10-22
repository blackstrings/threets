import * as THREE from 'three';

import {Line, Geometry, Ray, Vector2, Vector3, Line3} from 'three';
import { Colors } from './Colors';
import { Curve } from './Curve';
import { VectorUtils } from './VectorUtils';

/**
 * A utility class for anything that transforms to, or works with Lines
 *
 *
 *  LineUtils
 */
export class LineUtils {

	/**
	 * Takes two Vector3s and returns an instance of Line.
	 * Can take an optional material for initialization.
	 *
	 *
	 *  {Vector3} v1 first point
	 *  {Vector3} v2 second point
	 *  {THREE.LineBasicMaterial} [material] optional material
	 *  {Line}
	 *  {Error}
	 *  LineUtils
	 */
	public static createLineSegment(v1: Vector3, v2: Vector3, material?: THREE.LineBasicMaterial): Line {
		let line: Line = null;
		if(v1 && v2) {

			const geometry: Geometry = new Geometry();
			// push edge's p1 and p2 into geometry
			geometry.vertices.push(v1, v2);
			// create a line from the two points
			if(material) {
				line = new Line(geometry, material);
			} else {
				line = new Line(geometry);
			}
		} else {
			throw new Error(`unable to create a line segment: line is null`);
		}

		return line;
	}

	/**
	 * Takes two vectors and returns an instance of Line created at the origin and centered.
	 * When planning to add a line as child into a parent, use this method to create the lineGeo
	 * to avoid unwanted side effects in positioning.
	 *
	 *
	 *  {Vector3} v1
	 *  {Vector3} v2
	 *  {boolean} [center=true]
	 *  {THREE.LineBasicMaterial} [material]
	 *  {Error}
	 *  {Line}
	 *
	 *  LineUtils
	 */
	public static createLineSegmentAtOrigin(v1: Vector3, v2: Vector3, center: boolean = true,
											material?: THREE.LineBasicMaterial | THREE.LineDashedMaterial): Line {

		let line: Line = null;
		if(v1 && v2) {
			const lineGeo: Geometry = new Geometry();
			const dist: number = v1.distanceTo(v2);
			lineGeo.vertices.push(
				new Vector3(),
				new Vector3(dist, 0, 0)
			);

			if(material) {
				line = new Line(lineGeo, material);
			} else {
				line = new Line(lineGeo, new THREE.LineBasicMaterial({color: Colors.RED.value()}));
			}

			if(line) {
				if(center) {
					// offset line horizontally to center
					line.applyMatrix(new THREE.Matrix4().makeTranslation(-dist / 2, 0, 0));
				}
			} else {
				throw new Error('Failed to create line, line is null');
			}
		} else {
			throw new Error(`unable to create a line segment at origin: one or more parameters is null`);
		}

		return line;
	}

	/**
	 *
	 * param {Vector3} v1
	 * param {Vector3} v2
	 * param {Curve} curve
	 * param {Vector3} controlPoint - the Y value is the radius
	 * param {LineBasicMaterial} material
	 * throws {Error}
	 * returns {Line}
	 */
	public static createLineCurvedSegmentAtOrigin(v1: Vector3, v2: Vector3, curve: Curve, controlPoint: Vector3,
												  smoothness: number = 16,
												  material?: THREE.LineBasicMaterial): Line {
		let line: Line = null;
		if(v1 && v2 && curve && controlPoint) {
			const dist: number = v1.distanceTo(v2);
			const shape: THREE.Shape = new THREE.Shape();
			shape.moveTo(0, 0);
			if(curve === Curve.QUADRATIC) {
				shape.quadraticCurveTo((dist / 2) + controlPoint.x, controlPoint.y, dist, 0);
			} else if(curve === Curve.BEZIER) {
				shape.bezierCurveTo(0, controlPoint.y, dist, controlPoint.y, dist, 0);
			} else if(curve === Curve.CIRCLE) {
				shape.arc(0, 0, controlPoint.y, 0, 2 * Math.PI, false);
			} else if(curve === Curve.SEMICIRCLE) {
				shape.arc(-dist / 2, 0, controlPoint.y, Math.PI, 3 * Math.PI, true);
			} else {
				throw new Error('Failed to create line, curve type is invalid or cp2 is null');
			}

			const points: Vector3[] = VectorUtils.transformVector2sToVector3s(shape.getPoints(smoothness));
			const lineGeo: Geometry = new Geometry();
			lineGeo.vertices.push(...points);

			if(material) {
				line = new Line(lineGeo, material);
			} else {
				line = new Line(lineGeo, new THREE.LineBasicMaterial({color: Colors.RED.value()}));
			}

			if(line) {
				// offset line horizontally to center
				if(curve !== Curve.CIRCLE && curve !== Curve.SEMICIRCLE) {
					line.applyMatrix(new THREE.Matrix4().makeTranslation(-dist / 2, 0, 0));
				}
			} else {
				throw new Error('Failed to create line, line is null');
			}
		} else {
			throw new Error(`unable to create a line segment at origin: one or more parameters is null`);
		}

		return line;
	}

	/**
	 * Takes an array of Vector3 points and returns an Array of Lines created from those points.
	 * It goes from index to index (looping around to the start) to complete a shape.
	 *
	 *
	 *  {Array<Vector3>} vectors Array of points as Vector3
	 *  {THREE.LineBasicMaterial} [material] optional material
	 *  {Line}
	 *  {Error}
	 *  LineUtils
	 */
	public static createLineSegments(vectors: Array<Vector3>, material?: THREE.LineBasicMaterial): Array<Line> {
		let lines: Array<Line> = null;
		try {
			if(vectors) {
				lines = new Array<Line>();
				const size: number = vectors.length;
				for(let i = 0; i < size; i++) {
					let line: Line;
					if(material) {
						line = LineUtils.createLineSegment(vectors[i], vectors[(i + 1) % size], material);
					} else {
						line = LineUtils.createLineSegment(vectors[i], vectors[(i + 1) % size]);
					}
					if(line) {
						lines.push(line);
					} else {
						throw new Error(`cannot create line segment: line is null or undefined`);
					}
				}
			} else {
				throw new Error(`cannot create line segment: vectors are null or undefined`);
			}
		} catch(error) {
			throw (error);
		}
		return lines;
	}

	/**
	 * Creates the semicircular line for the SEMICIRCLE Curve
	 *
	 * param {Vector3} start
	 * param {Vector3} end
	 * param {Vector3} controlPoint
	 * optional param {THREE.LineBasicMaterial} material
	 */
	public static createSemicircleLine(sidePosition: number, start: Vector3, end: Vector3, controlPoint: Vector3,
									   material?: THREE.LineBasicMaterial): Line {
		let line: Line;
		const circularLine: Line = LineUtils.createLineCurvedSegmentAtOrigin(start, end, Curve.SEMICIRCLE, controlPoint);
		const circularGeo: Geometry = circularLine.geometry as Geometry;
		const circularPoints: Vector3[] = LineUtils.trimPointsForSemicircle(circularGeo.vertices as Vector3[], sidePosition);
		const lineGeo: Geometry = new Geometry();
		lineGeo.vertices.push(...circularPoints);
		if(material) {
			line = new Line(lineGeo, material);
		} else {
			line = new Line(lineGeo);
		}
		if(!line) {
			throw new Error('Failed to create semicircular line');
		}
		return line;
	}

	/**
	 * Trims the points of the circle that have a lower x value than the previous side
	 *
	 * param {Vector3[]} points
	 * returns {Vector3[]}
	 */
	private static trimPointsForSemicircle(points: Vector3[], xLimit: number): Vector3[] {
		let trimmedPoints: Vector3[] = [];
		if(points && points.length) {
			for(const point of points) {
				if(point) {
					if(xLimit < point.x) {
						if(trimmedPoints.length === 0) {
							trimmedPoints.push(new Vector3(xLimit, point.y));
						}
						trimmedPoints.push(point);
					}
				}
			}
			if(trimmedPoints.length) {
				trimmedPoints.push(new Vector3(xLimit, trimmedPoints[trimmedPoints.length - 1].y));
			}
		}
		return trimmedPoints;
	}

	/**
	 * Creates a Ray from a Line in the direction of the Line's end point
	 *
	 *
	 *  {Line} line
	 *  {THREE.Ray}
	 *  {Error}
	 *  LineUtils
	 */
	public static createRay(line: Line3): Ray {
		let ray: Ray = null;
		if(line) {
			const endPoint: Vector3 = line.end.clone();
			const startPoint: Vector3 = line.start.clone();

			const direction: Vector3 = endPoint.sub(startPoint) as Vector3;
			ray = new Ray(line.start, direction);
		} else {
			throw new Error(`unable to create ray: line is null`);
		}
		return ray;
	}

	public static isPositive(start: Vector3, end: Vector3, intersection: Vector3) {
		const v1 = new THREE.Vector3().copy(end).sub(start);
		const v2 = new THREE.Vector3().copy(intersection).sub(start);
		return v1.dot(v2) >= 0;
	}

	/**
	 * Given two line segments, it will return a point if there is a intersection or a possible intersection
	 * when traveling in the direction from START to END
	 * but NOT when traveling from end to start.
	 * If there is no intersection, it will return null.
	 *
	 * Note: The two line start and end points cannot have Z values and HAS to be on the same XY plane.
	 * Mathematically it is rare and not practical to find a possible intersection of two lines when Z values are
	 * involved due to floating point numbers and how infinitely small a line thickness can be. Thus why Threejs
	 * doesn't implement a method where Rays can intersect other Rays.
	 */
	public static findPossibleIntersection(line1Start: Vector3, line1End: Vector3, line2Start: Vector3, line2End: Vector3): Vector3 {
		let intersection: Vector3 = null;
		if(line1Start && line1End && line2Start && line2End) {
			if(!(line1Start.equals(line1End)) || !(line2Start.equals(line2End))) {
				const A: Vector3 = line1Start.clone();
				const B: Vector3 = line1End.clone();
				const C: Vector3 = line2Start.clone();
				const D: Vector3 = line2End.clone();

				// Line AB represented as a1x + b1y = c1
				const a1: number = B.y - A.y;
				const b1: number = A.x - B.x;
				const c1: number = a1 * (A.x) + b1 * (A.y);

				// Line CD represented as a2x + b2y = c2
				const a2: number = D.y - C.y;
				const b2: number = C.x - D.x;
				const c2: number = a2 * (C.x) + b2 * (C.y);

				const determinant: number = a1 * b2 - a2 * b1;

				if(determinant === 0) {
					// The lines are parallel.
				} else {
					const x: number = (b2 * c1 - b1 * c2) / determinant;
					const y: number = (a1 * c2 - a2 * c1) / determinant;
					intersection = new Vector3(x, y);
				}

				// if there is an intersection. verify intersection occurs on the two line segments
				// when calculating from start to end
				if(intersection) {
					const line1result: boolean = LineUtils.isPositive(line1Start, line1End, intersection);
					const line2result: boolean = LineUtils.isPositive(line2Start, line2End, intersection);
					if(line1result && line2result) {
						// do nothing when the intersection is not "false" as both results are "true"
					} else { //
						// set intersection to null when the intersection is "false" as one of results is "false"
						intersection = null;
					}
				}
			}
		}
		return intersection;
	}

}
