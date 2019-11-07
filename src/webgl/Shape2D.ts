
import {Line3, Mesh, MeshBasicMaterial, Vector2, Vector3} from 'three';
import {ShapeFactory} from '../utils/ShapeFactory';
import { VectorUtils } from '../utils/VectorUtils';
export class Shape2D {

	public mesh: Mesh;
	public sides: Line3[] = [];

	constructor(public points: Vector2[], private color: number = 0xff0000){
		if(points && points.length >= 3){
			this.create2D();
			this.createSides();
		} else {
			throw new Error('Failed to create shape2D, sides are empty or side count is less than 3');
		}
	}

	private create2D(): void {
		if(!this.mesh){
			const geo = ShapeFactory.create2dGeometry(this.getPoints());
			this.mesh = new Mesh(geo, new MeshBasicMaterial({color: this.color, transparent: true, opacity: .5}));
		}

	}

	public getPoints(): Vector2[]  {
		return this.points;
	}

	public getSide(sideIndex: number): Line3 {
		if(this.sides && this.sides.length){
			const side: Line3 = this.sides[sideIndex];
			if(side){
				return side;
			}
		}
		return null;
	}

	/** returns normalized direction from start to end in clockwise order */
	public getSideDirection(sideIndex: number): Vector3 {
		const side: Line3 = this.getSide(sideIndex);
		if(side){
			return side.end.clone().sub(side.start).normalize();
		}
		return null;
	}

	public getSideCenter(sideIndex: number): Vector3 {
		const side: Line3 = this.getSide(sideIndex);
		if(side){
			return VectorUtils.getCenterPoint(side.start, side.end);
		}
	}

	public getSideVectorNormal(sideIndex: number): Vector3 {
		const side: Line3 = this.getSide(sideIndex);
		if(side){
			const sideDir: Vector3 = this.getSideDirection(sideIndex);
			if(sideDir){
				VectorUtils.rotate90CCW(sideDir);
				return sideDir;
			}
		}
		return null;
	}

	public getSideDistance(index: number): number {
		const side: Line3 = this.getSide(index);
		if(side){
			return side.start.distanceTo(side.end);
		}
		return 0;
	}

	private createSides(): void {
		if(this.sides && this.points){
			this.sides = [];
			for(let i=0; i<this.points.length; i++){
				let nextIndex: number = i + 1;
				if(nextIndex >= this.points.length){
					nextIndex = 0;
				}
				const c: Vector2 = this.points[i];
				const n: Vector2 = this.points[nextIndex];
				this.sides.push(new Line3(new Vector3(c.x, c.y), new Vector3(n.x, n.y)));
			};
		}
	}
}
