varying vec2 vUv;
uniform float textureRepeat;
uniform bool uvMultiply;

void main()
{
    vUv = uv;
    if(uvMultiply){
        vUv = uv * textureRepeat;
    } else {
        vUv = uv / textureRepeat;
    }
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}
