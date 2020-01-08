uniform sampler2D texture;
uniform sampler2D texture2;
uniform vec3 color;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
uniform float repeatX;
uniform float repeatY;
uniform bool uvMultiply;
//vec4 tColor;

void main() {
    vec4 tc = vec4(color.r, color.g, color.b, 1.0 );

    /*
    if(uvMultiply){
	    tColor = texture2D( texture, vUv * textureRepeat);
	} else {
	    tColor = texture2D( texture, vUv / textureRepeat);
	}
	*/

	vec4 tColor = texture2D( texture, vUv / vec2(repeatX, repeatY));
	vec4 tColor2 = texture2D( texture2, vUv / repeatY);

	// hack in a fake pointlight at camera location, plus ambient
	vec3 normal = normalize( vNormal );
	vec3 lightDir = normalize( vViewPosition );

	float dotProduct = max( dot( normal, lightDir ), 0.0 ) + 0.2;

    //gl_FragColor = vec4( mix( tColor.rgb, tColor2.rgb, tColor2.a ), 1.0 ) * dotProduct;
    
    vec4 mix_c = tColor2 + tc * tColor2.a;
    gl_FragColor = vec4( mix( tColor.rgb, mix_c.xyz, tColor2.a ), 1.0 ) * dotProduct;
}
