import * as THREE from 'three';
import {Geometry, Vector3, Vector2, Mesh, Line} from 'three';

/**
 * Use this utils for rotating, translating, scaling textures on 3d objects.
 * Although you can manipulate the texture scale, rotation, and offset directly, don't do it.
 * This is a poor man's way of modifying texture orientation, so modify UVs instead and avoid modifying the texture
 * directly.
 *
 * Threejs by default does not have UV utilities. All users are force to implement their own.
 * This is due to the complexity of 3D in general and that geometries can have many UV patterns based on their shape.
 * Every geometry basically need its own special UV wrapping methodology.
 * However, similar geometries/shapes can indeed share similar UV functions to modify/unwrap their UVs.
 *
 * What is UV?
 * U and V are essentially X and Y and are related to texture mapping.
 * Since X and Y are already associated with 3d object coordinates.
 * U and V were introduced to prevent confusion when talking about texture
 * coordinate location vs 3d object coordinate location.
 *
 * What is UV mapping/unwrapping?
 * UV mapping or UV unwrapping is the technique used to place textures onto 3d object.
 * All UV mapping techniques should be implemented in this class as needed.
 *
 * Unwrapping UV is also another way to say 'create UVs' for a geometry.
 * Without UVs, geometry cannot show texture on a material properly.
 * If the geometry already has UVs, unwrapping UVs on the same geometry should overwrite old UVs, so do not leave
 * behind orphan uvs.
 *
 * There are some disciplines required to understand the codes within the functions in this class and to write more
 * functions around UVs. Here are the topics one can start to familiarize themselves with before diving into these
 * codes.
 * - UVs in general
 * - UVs the common 0-1 range - staying within the range and extending beyond the range for repetition
 * - UVs in 2D space and how they relate to 3D space through faces/vertices.
 * - How geometry faces are created
 * - How geometry faces relate to UVs by vertices
 * - Threejs Buffer Geometries in general and how they differ from threejs regular geometries
 * - THREE.BufferAttribute and how they are used in buffer geometries
 * - Transforming UVs through matrix using THREE.BufferAttribute with Float32Arrays
 *
 *  UvUtils
 */
export class UvUtils {

	/**
	 * Set UVs to a specific rotation on non-buffer geometry in local-space.
	 * This method rotates UVs from the local-space as UVs rotate from the geometry intact vertices.
	 * To rotate by incremental degrees, see UvUtils.rotateUVsByDegree
	 *
	 * This technique clones the geometry, and rotates the cloned geometry, then copies the rotated vertex
	 * on the cloned geometry back to the real geometry's UV values.
	 *
	 * Recommended for mesh who meet the following requirements:
	 * - flast mesh on XY plane
	 * - Uses repeating texture
	 *
	 * Works on extruded shape geometries, which are non buffer geometries.
	 *
	 *
	 *  {number} degree
	 *  {THREE.Geometry} geo
	 *  {Error}
	 *  UvUtils
	 */
	public static setUvRotationOnGeometry(degree: number, geo: THREE.Geometry): void {
		if(!degree && degree !== 0) {
			throw new Error('<< UvUtils >> Failed to set UV rotation on geometry, degree is invalid: ' + degree);
		} else {

			if(geo) {
				const radians: number = THREE.Math.degToRad(degree);
				const cloneGeo: THREE.Geometry = geo.clone();
				if(!cloneGeo) {
					throw new Error('<< UvUtils >> Cannot rotate UV, clone geometry is null');
				}

				// rotate the clone geo which will rotate the vertices accordingly
				cloneGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(-radians));

				// apply clonedGeo's vertices coordinates to the original geometry UVs
				for(let faceIndex: number = 0; faceIndex < cloneGeo.faces.length; faceIndex++) {
					const cloneGeoFace: THREE.Face3 = cloneGeo.faces[faceIndex];
					// get the face vertices indexes, each face will always have a,b,c
					// each face has 3 index - a, b, c, whom each references an index in the geometry.vertices array.
					const a: number = cloneGeoFace.a;
					const b: number = cloneGeoFace.b;
					const c: number = cloneGeoFace.c;

					// now we have the 3 index, get the vertices that belong to this current face
					const v1: Vector3 = cloneGeo.vertices[a] as Vector3;
					const v2: Vector3 = cloneGeo.vertices[b] as Vector3;
					const v3: Vector3 = cloneGeo.vertices[c] as Vector3;

					// change the UV values on the geo's face
					geo.faceVertexUvs[0][faceIndex][0].set(v1.x, v1.y);
					geo.faceVertexUvs[0][faceIndex][1].set(v2.x, v2.y);
					geo.faceVertexUvs[0][faceIndex][2].set(v3.x, v3.y);
				}

				// explicitly flag to get the render to pick up the changes
				geo.uvsNeedUpdate = true;

			} else {
				throw new Error('<< UvUtils >> Failed to set UV rotation on geometry, geometry is invalid');
			}

		} // end of degree is valid

	}

	/**
	 * Helper method for setting the texture rotation on buffer geometry.
	 * - this performs local rotation
	 *
	 *  {number} degree
	 *  {(THREE.Geometry | THREE.BufferGeometry)}
	 *  {Error}
	 *  UvUtils
	 */
	public static setUvRotationOnBufferGeometry(degree: number, geo: THREE.BufferGeometry): void {
		if(degree && geo) {

			const radians: number = THREE.Math.degToRad(degree);

			// get a non buffer geometry to work with
			const nonBufferGeo: THREE.Geometry = this.getNonBufferGeometry(geo.clone());
			if(!nonBufferGeo) {
				throw new Error('<< UvUtils >> Cannot set UV rotation, nonBufferGeo is null');
			}

			// rotate the non buffer geometry
			nonBufferGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(radians));

			// transfer non-buffer geometry's vertices' values to the buffer geometry's UVs
			let index: number = 0;
			nonBufferGeo.vertices.forEach(function(v) {
				(<THREE.BufferGeometry>geo).getAttribute('uv').setXY(index, v.x, v.y);
				index++;
			});

			(<THREE.BufferAttribute>geo.getAttribute('uv')).needsUpdate = true;

		} else {
			throw new Error('<< UvUtils >> Cannot rotate UV on buffer geometry, degree or geometry is null');
		}
	}

	/**
	 * Flips all faces on a Geometry
	 *
	 *
	 *  {THREE.Geometry} geometry
	 *  UvUtils
	 */
	public static flipFaceNormalOnGeo(geometry: THREE.Geometry): void {

		for(const face of geometry.faces) {
			const temp: number = face.a;
			face.a = face.c;
			face.c = temp;
		}
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		const faceVertexUvs: THREE.Vector2[][] = geometry.faceVertexUvs[0];

		for(let i: number = 0; i < faceVertexUvs.length; i++) {
			const temp: THREE.Vector2 = faceVertexUvs[i][0];
			faceVertexUvs[i][0] = faceVertexUvs[i][2];
			faceVertexUvs[i][2] = temp;
		}
		geometry.uvsNeedUpdate = true;
	}

	/**
	 * Helper method to return a non-buffer geometry if geo is a buffer.
	 *
	 *
	 *  {(THREE.Geometry | THREE.BufferGeometry)} geo
	 *  {THREE.Geometry}
	 *  {Error}
	 *  UvUtils
	 */
	private static getNonBufferGeometry(geo: THREE.Geometry | THREE.BufferGeometry): THREE.Geometry {
		if(geo && geo instanceof THREE.BufferGeometry) {
			return new THREE.Geometry().fromBufferGeometry(geo);
		} else if(geo instanceof THREE.Geometry) {
			return geo;
		}
		throw new Error('<< UvUtils >> Cannot get NonBufferGeometry: geometry is null');
	}

	// ----------------------------------- UV Creation & Unwrapping Methods
	// -----------------------------------------------

	/**
	 * Unwraps UVs on any plane geometry from edge to edge.
	 * Most useful for retangular & square shapes, but can also work on non-rectangular shapes, but the texture layout
	 * will have to be considerate of this. Not suitable for basic planes that wish to utilize repeating textures. Once
	 * the texture is applied, the texture will stretch across the entire plane geometry from edge to edge.
	 *
	 * Note: By default if you create plane geometry using THREE.PlaneGeometry or any of threejs's geometry,
	 * the geometry comes with a UV map already in place. The default UV map may or may not be what you want.
	 * Using this method will override that default UV mapping.
	 *
	 *
	 *
	 *  {Error}
	 *  {THREE.BufferGeometry} geo
	 *  UvUtils
	 *  img UvUtils_planeProjection.png
	 */
	public static planeProjectionOnBufferedGeometry(geo: THREE.BufferGeometry): void {
		if(geo) {
			geo.computeBoundingBox();
			const bbox = geo.boundingBox;
			const uMax = bbox.max.x - bbox.min.x;
			const vMax = bbox.max.y - bbox.min.y;

			const uvs: THREE.BufferAttribute = geo.getAttribute('uv') as THREE.BufferAttribute;

			if(uvs) {

				// indicates how many items make up a group in the array - (buffer geometry related)
				const itemSize = uvs.itemSize;

				// get the true vertices count from the buffer geometry
				const trueVertsCount = uvs.array.length / itemSize;
				for(let vertexIndex = 0; vertexIndex < trueVertsCount; vertexIndex++) {

					// convert each vertex x & y points down to a 0-1 scale for the UV
					const vertX = uvs.getX(vertexIndex) / uMax;
					const vertY = uvs.getY(vertexIndex) / vMax;

					// update the uv
					uvs.setXY(vertexIndex, vertX, vertY);
				}
				uvs.needsUpdate = true;
			} else {
				throw new Error('<< UvUtils >> Failed to create UVs for geometry, uvs are null');
			}
		} else {
			throw new Error('<< UvUtils >> Failed to create UVs for geometry, geometry is null');
		}
	}

	/**
	 * This will update the UVs for the geometry.  If you move geometry directly by its vertices you will need to pass
	 * in the point's origin
	 *
	 *
	 *
	 *  {THREE.Geometry} geo
	 *  {Vector3} [origin]
	 *  UvUtils
	 */
	public static planeProjectionOnGeometry(geo: THREE.Geometry, origin?: Vector3) {
		if(geo) {
			geo.computeBoundingBox();
			const bbox = geo.boundingBox;
			const uMax = bbox.max.x - bbox.min.x;
			const vMax = bbox.max.y - bbox.min.y;

			// apply clonedGeo's vertices coordinates to the original geometry UVs
			for(let faceIndex: number = 0; faceIndex < geo.faces.length; faceIndex++) {

				// three points on the face
				const a: THREE.Vector2 = geo.faceVertexUvs[0][faceIndex][0];
				const b: THREE.Vector2 = geo.faceVertexUvs[0][faceIndex][1];
				const c: THREE.Vector2 = geo.faceVertexUvs[0][faceIndex][2];

				// offset the face vertices by the origin passed in
				if(origin) {
					a.x -= origin.x;
					a.y -= origin.y;

					b.x -= origin.x;
					b.y -= origin.y;

					c.x -= origin.x;
					c.y -= origin.y;
				}

				// change the UV values on the geo's face
				geo.faceVertexUvs[0][faceIndex][0].set(a.x / uMax, a.y / vMax);
				geo.faceVertexUvs[0][faceIndex][1].set(b.x / uMax, b.y / vMax);
				geo.faceVertexUvs[0][faceIndex][2].set(c.x / uMax, c.y / vMax);

			}

			// explicitly flag to get the render to pick up the changes
			geo.uvsNeedUpdate = true;
		} else {
			throw new Error('<< UvUtils >> Failed to create UVs for geometry, geometry is null');
		}
	}

	/**
	 * UV are rotated 90 Degrees from the current UV rotation.
	 * This method takes a Geometry and returns that same Geometry with the faceVertexUVs rotated by a positive 90
	 * degrees. It accomplishes this by iterating through all the Faces of the geometry, and subsequently the
	 * individual Vector2s of each of those Faces, setting the y value of the Vector2s to the x value, and the x value
	 * of the Vector2s to the negated y value, effectively rotating the UVs by a positive 90 degrees.
	 *
	 *
	 *  {Geometry} geometry
	 *  {Geometry}
	 *  UvUtils
	 */
	public static rotateUVs(geometry: Geometry): Geometry {
		const uvs: THREE.Vector2[][][] = geometry.faceVertexUvs;

		uvs[0].forEach((tuple) => {
			tuple.forEach((vec) => {
				const temp: number = vec.y;
				vec.y = vec.x;
				vec.x = temp;
			});
		});

		return geometry;
	}

	/**
	 * Rotates the mesh's UV from their current positions.
	 * This is an incremental rotation.
	 * Thus, calling the method multiple times will increment UV rotation from their current positions.
	 *
	 * Best recommended on a Mesh who meets all the following requirements:
	 * - Mesh is a flat planar mesh
	 * - Geometry vertices exist the XY plane
	 * - Its vertices are in world space and not local
	 * - Mesh has a repeating texture
	 *
	 * Rotating UVs uses a technique that involves THREE.BufferAttribute
	 * Once buffers are rotated, the rotated UV buffer values are copied back to the actual UV objects.
	 *
	 * param mesh the mesh which UVs to rotate
	 * param worldSpaceDegree the rotation degree at which to set the UV to
	 */
	public static rotateUVsByDegree(mesh: Mesh, degree: number) {
		if(mesh) {
			if(!degree && degree !== 0) {
				throw new Error('<< UvUtils >> Failed to rotate uvs, degree is undefined, null, NaN');
			} else {

				if(mesh.geometry && (mesh.geometry instanceof Geometry || mesh.geometry instanceof THREE.ShapeGeometry)) {

					const getClones: boolean = false; // false so we get the actual UV object references
					const UVs: Vector2[] = UvUtils.getMeshUVs(mesh, getClones);

					// prepare a float32 array that will eventually contain all the serialized UVs
					const itemSize: number = 2;	// a UV has x and y, so there are two properties in a UV

					// Create a float32 array with the correct size to contain all the mesh's UVs
					// itemSize * number of uvs = the exact size to contain all your UVs and their values
					// +2 for when using matrix4.applyToBufferAttribute, it'll be out of range by 1, when looking for
					// the last z value (bug in 85 threejs)
					const float32: Float32Array = new Float32Array(UVs.length * itemSize + 2);

					// create the BufferAttribute from the float32 and itemsize, we will perform rotation on the
					// bufferAttribute
					const attr: THREE.BufferAttribute = new THREE.BufferAttribute(float32, itemSize);

					// UV Serialization - serialize all the uvs into the attribute
					// We have already set our bufferAttribute with the correct itemSize and float32 size
					// that will allow us to accurately serialize the UVs into the bufferAttribute
					// copy all the uvs values to the buffer attribute
					attr.copyVector2sArray(UVs);

					const radian: number = THREE.Math.degToRad(degree);
					// use a Matrix4 to rotate the serialized UV values
					// TODO xl applyToBuffer is deprecated switch to applyToBufferAttribute() when we up threejs
					// version from 85 to 95+
					new THREE.Matrix4().makeRotationZ(radian).applyToBuffer(attr);

					// Deserialize the UVs from buffers back into real Vector2s
					// -2 due to bug where we added additional count with +2 above, but we don't want to loop to the
					// last index
					for(let i = 0; i < attr.count - 2; i++) {
						const rotatedUV: Vector2 = new Vector2().fromBufferAttribute(attr, i) as Vector2;
						UVs[i].copy(rotatedUV);
					}
				} else {
					throw new Error('<< UvUtils >> Failed to rotate uvs, mesh geometry is null or invalid');
				}

			}
		} else {
			throw new Error('<< UvUtils >> Failed to rotate uvs, mesh is null');
		}
	}

	/**
	 * Updates the UVs on the geometry to match the shape of the geometry.
	 * Used to correct textures on a geometry when it changes size, especially if the geometry has repeating textures.
	 * This will correct stretched textures.
	 *
	 * Intended for planar geometry, but may also work on extruded shape geometries.
	 * param geometry
	 */
	public static matchUVsWithGeometryVertices(geometry: THREE.Geometry | THREE.ShapeGeometry): void {
		if(geometry) {
			if(geometry.faceVertexUvs[0]) {
				const faceUVs: Vector2[][] = geometry.faceVertexUvs[0] as Vector2[][];
				if(faceUVs && faceUVs.length) {

					// faces reference vertex indices and not the actual vertex reference
					const verts: Vector3[] = geometry.vertices as Vector3[];

					// iterate through the faces and update the faceUVs
					let i: number = 0;
					geometry.faces.forEach(face => {
						// get the three vertex belonging to the current face
						const v0: Vector3 = verts[face.a];
						const v1: Vector3 = verts[face.b];
						const v2: Vector3 = verts[face.c];

						// faceUVs index (0,1,2) follows the same order as face vertex indices (a,b,c)
						// set the each faceUV to its corresponding face vertex xy values
						faceUVs[i][0].set(v0.x, v0.y);
						faceUVs[i][1].set(v1.x, v1.y);
						faceUVs[i][2].set(v2.x, v2.y);
						i++;
					});

					geometry.uvsNeedUpdate = true;

				} else {
					throw new Error('Failed to update UVs, the geometry has no UVs in its faceVertexUVs');
				}
			} else {
				throw new Error('Failed to update UVs, the geometry has no faceVertexUVs');
			}
		} else {
			throw new Error('<< UvUtils >> Failed ot update UVs on planar geometry, geo is null');
		}
	}

	/**
	 * Update the UVs to be at the same location as the planar mesh's geometry's vertices.
	 * Note: only intended for flat planar meshes which are on the XY plane and who uses repeating textures.
	 * The method updates the UVs coords to match the new vertices of the updated mesh.
	 */
	public static matchUVsWithMeshShape(mesh: Mesh) {
		if(mesh) {
			if(mesh.geometry instanceof THREE.Geometry || mesh.geometry instanceof THREE.ShapeGeometry) {
				try {
					UvUtils.matchUVsWithGeometryVertices(mesh.geometry);
				} catch(e) {
					throw e;
				}
			} else {
				throw new Error('Failed to update UVs, mesh geometry is not instanceof Geometry');
			}
		} else {
			throw new Error('Failed to update UVs, mesh is null');
		}
	}

	public static getLineFromGeometryUVs(geometry: THREE.Geometry | THREE.ShapeGeometry): Line {
		if(geometry) {
			const uvs: Vector2[] = UvUtils.getGeometryUVs(geometry);
			if(uvs.length) {
				const lineGeo: Geometry = new Geometry();

				// todo xl enable when we merge landscape IDD project into dev
				// VectorUtils.transformVector2sToVector3s(uvs);
				const uvsVec3s: Vector3[] = [];
				uvs.forEach((uv: Vector2) => {
					uvsVec3s.push(new Vector3(uv.x, uv.y, 0));
				});

				lineGeo.vertices.push(...uvsVec3s);
				const line = new Line(lineGeo, new THREE.LineBasicMaterial({color: 0xff0000}));
				return line;
			} else {
				throw new Error('<< UvUtils >> Failed to get line from geometry UVs, there are no UVs on the geometry');
			}
		} else {
			throw new Error('<< UvUtils >> Failed to get line from geometry UVs, geometry is null');
		}
	}

	/**
	 * Returns a visual line that can be put into the scene to help debug UVs.
	 * The line represents the mesh's entire UVs.
	 * Useful for debugging UVs visually.
	 *
	 * param mesh the UVs on the mesh to target
	 */
	public static getLineFromMeshUVs(mesh): Line {
		if(mesh) {
			if(mesh.geometry instanceof THREE.Geometry || mesh.geometry instanceof THREE.ShapeGeometry) {

				return UvUtils.getLineFromGeometryUVs(mesh.geometry);

			} else {
				throw new Error('<< UvUtils >> Failed to get line from mesh UVs, geometry is not instanceof of valid Geometry type');
			}
		} else {
			throw new Error('<< UvUtils >> Failed to get line from mesh UVs, mesh is null');
		}
	}

	/**
	 * Returns the geometry's UVs.
	 * Returned UVs are cloned by default unless specified by passing in false for getClones.
	 *
	 * Iterates through each face in the geometry and collects 3 UV points per face.
	 * The iteration order of faces is exactly as how faces are lined up in the Geometry's faces array.
	 *
	 * param geometry
	 * param getClones
	 */
	public static getGeometryUVs(geometry: THREE.Geometry | THREE.ShapeGeometry, getClones: boolean = true): Vector2[] {
		if(geometry) {

			const UVs: Vector2[] = []; 	// vector2s
			// get the first set of UVs, as UVs can have many sets, but by default there is usually only one set
			const faceVertexUVs: THREE.Vector2[][] = geometry.faceVertexUvs[0];

			// verify there is a UV set on this mesh
			if(faceVertexUVs && faceVertexUVs.length) {

				// gather 3 UVs from each face
				faceVertexUVs.forEach((faceUVs: THREE.Vector2[]) => {
					faceUVs.forEach((uv: Vector2) => {
						if(getClones) {
							UVs.push(uv.clone());
						} else {
							UVs.push(uv);
						}
					});
				});

				return UVs;
			} else {
				throw new Error('<< UvUtils >> Failed to get uvs, no UVs exist on geometry');
			}
		} else {
			throw new Error('<< UvUtils >> Failed to get geometry UVs, geometry is null');
		}
	}

	/**
	 * Returns an array of UVs from a mesh. Cloned UVs are returned by default unless false is passed in.
	 *
	 * param mesh the mesh which to get UVs from
	 * param getClones returns cloned UVs if true, false for actual UVs objects references.
	 */
	public static getMeshUVs(mesh: Mesh, getClones: boolean = true): Vector2[] {
		if(mesh) {
			if(mesh.geometry instanceof THREE.Geometry || mesh.geometry instanceof THREE.ShapeGeometry) {

				return UvUtils.getGeometryUVs(mesh.geometry, getClones);

			} else {
				throw new Error('<< UvUtils >> Failed to get uvs, mesh geometry not supported');
			}
		} else {
			throw new Error('<< UvUtils >> Failed to get uvs, mesh is null');
		}
	}
}
