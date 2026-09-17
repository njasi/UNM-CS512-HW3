#version 300 es

in vec3 aPosition;
in vec3 aColor;

uniform float uTime; //time in sec
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelTransformationMatrix;

out vec3 vColor;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * uModelTransformationMatrix * vec4(aPosition, 1.0f);
    vColor = aColor;
}