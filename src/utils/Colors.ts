/**
 * Containes color codes in HEX format. These Colors are used in various places within the canvas of the Deck
 * application.
 *
 *
 *  Colors
 */
export class Colors {

	protected static values: Map<number, Colors> = new Map<number, Colors>();

	/**
	 * Ain't nuthin' any blacker...
	 *
	 *
	 *  Colors
	 */
	public static readonly ABSOLUTE_BLACK = new Colors(0x000000);

	/**
	 * Used by Dimensions
	 *
	 *
	 *  Colors
	 */
	public static readonly BLACK = new Colors(0x021919);

	/**
	 * Used by Dimensions
	 *
	 *
	 *  Colors
	 */
	public static readonly PITCH_BLACK = new Colors(0x000000);

	/**
	 * MESH_BASIC_DEFAULT
	 *
	 *
	 *  Colors
	 */
	public static readonly BLUE = new Colors(0x2D8BF6);

	/**
	 * Used by UnattachedWall highlighted
	 *
	 *
	 *  Colors
	 */
	public static readonly DARK_BLUE = new Colors(0x0B477A);
	public static readonly AQUA_BLUE = new Colors(0x00A6FF);
	public static readonly AQUA_BLUE_LIGHT = new Colors(0x7EB3F7);

	/**
	 * Used by Corner (future)
	 *
	 *
	 *  Colors
	 */
	public static readonly LIGHT_BLUE = new Colors(0x8EC0F8);

	/**
	 * Used by Framing2D Dark
	 *
	 *
	 *  Colors
	 */
	public static readonly BROWN = new Colors(0xAE4902);

	/**
	 * Used by Framing2D, Railing2D
	 *
	 *
	 *  Colors
	 */
	public static readonly LIGHT_BROWN = new Colors(0xCD853F);

	/**
	 * Used by HeightPost in LevelHeight Screen
	 *
	 *
	 *  Colors
	 */
	public static readonly DARK_BROWN = new Colors(0x7D591D);

	public static readonly DEEP_BROWN = new Colors(0x422605);

	/**
	 * Used by Level2D
	 *
	 *
	 *  Colors
	 */
	public static readonly TAN = new Colors(0xD0AE57);

	/**
	 * Used by Patio2D
	 *
	 *
	 *  Colors
	 */
	public static readonly LIGHT_TAN = new Colors(0xE3CE9A);

	/**
	 * Used by DeckSide2D unhighlighted
	 *
	 *
	 *  Colors
	 */
	public static readonly GREY = new Colors(0x999999);

	/**
	 * Used by DeckSide2D highlighted
	 *
	 *
	 *  Colors
	 */
	public static readonly DARK_GREY = new Colors(0x505557);

	/**
	 * Used by Grid
	 *
	 *
	 *  Colors
	 */
	public static readonly LIGHT_GREY = new Colors(0xEDEDED);

	/**
	 * Used by LevelHeight Grass
	 *
	 *
	 *  Colors
	 */
	public static readonly GREEN = new Colors(0x70F62F);
	public static readonly GREEN_DARK = new Colors(0x00be00);

	public static readonly MENARDS_GREEN = new Colors(0x009a3d);
	public static readonly MENARDS_GREEN_LIGHT = new Colors(0x35C45F);

	/**
	 * Used by AttachedWall unhighlighted
	 *
	 *
	 *  Colors
	 */
	public static readonly MENARDS_YELLOW = new Colors(0xf7cd09);

	public static readonly DARK_YELLOW = new Colors(0xAA9120);

	/**
	 * Used as default color for Materials that could not be loaded. Typically, if an object is displayed in RED, there
	 * was a problem loading Material.
	 *
	 *
	 *  Colors
	 */
	public static readonly RED = new Colors(0xFF0000);

	/**
	 * Used by Drag Proxy
	 *
	 *
	 *  Colors
	 */
	public static readonly LIGHT_RED = new Colors(0xFF3333);

	/**
	 * Used in multiple places: FramingMaterial3D, Decking3D, Cladding3D, Railing3D
	 *
	 *
	 *  Colors
	 */
	public static readonly WHITE = new Colors(0xF5F4F2);

	public static readonly PURE_WHITE = new Colors(0xFFFFFF);

	protected constructor(protected _value: number) {
		Colors.values.set(_value, this);
	}

	public value(): number {
		return this._value;
	}

	public static fromValue(value: number): Colors {
		return Colors.values.has(value) ? Colors.values.get(value) : null;
	}

}
