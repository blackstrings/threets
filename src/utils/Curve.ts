export class Curve {

	public static readonly BEZIER = new Curve('bezier');
	public static readonly QUADRATIC = new Curve('quadratic');
	public static readonly CIRCLE = new Curve('circle');
	public static readonly SEMICIRCLE = new Curve('semicircle');
	public static readonly FREEFORM = new Curve('freeform');

	protected constructor(public value: string) {
	}

	public static findByValue(value: string): Curve {
		switch(value) {
			case Curve.BEZIER.value:
				return Curve.BEZIER;
			case Curve.QUADRATIC.value:
				return Curve.QUADRATIC;
			case Curve.CIRCLE.value:
				return Curve.CIRCLE;
			case Curve.SEMICIRCLE.value:
				return Curve.SEMICIRCLE;
			case Curve.FREEFORM.value:
				return Curve.FREEFORM;
			default:
				return null;
		}
	}

	public toString(): string {
		return this.value;
	}

}
