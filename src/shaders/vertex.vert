#version 300 es

in vec3 aPosition;
in vec3 aColor;

uniform float uTime; // time in sec
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelTransformationMatrix;

// object translation coords, not an actual
// translation matrix
uniform vec2 uPositionTranslation; 

out vec3 vColor;

// create a 2d scaling matrix
mat3 scaling2D(float xs, float ys){
  return mat3(
    xs , 0.0, 0.0,
    0.0,  ys, 0.0,
    0.0, 0.0, 1.0
  );
}

// create a 2d rotation matrix
mat3 rotate2D(float angle){
  return mat3(
    cos(angle)        , sin(angle), 0.0,
    -1.0 * sin(angle) , cos(angle), 0.0,
    0.0               , 0.0       , 1.0
  );
}

// create a 2d shear matrix
// to shear in only x/y leave the other param = 0
mat3 shear2D(float xs, float ys){
  return mat3(
    1.0, ys , 0.0,
    xs , 1.0, 0.0,
    0.0, 0.0, 1.0
  );
}

// create a 2d mirror matrix
// to mirror across X angle = 1/2 pi rad, 3/2 pi rad etc
// to mirror across Y angle = 0 rad, pi rad etc
mat3 mirror2D(float angle){
  return mat3(
    cos(2.0 * angle), sin(2.0 * angle)        , 0.0,
    sin(2.0 * angle), -1.0 * cos(2.0 * angle) , 0.0,
    0.0             , 0.0                     , 1.0
  );
}

// create a 2d translation matrix
mat3 translate2D(float tx, float ty){
  return mat3(
    1.0, 0.0, 0.0 ,
    0.0, 1.0, 0.0 ,
    tx , ty , 1.0
  );
}

void main() {

  
  gl_Position = uProjectionMatrix * uModelViewMatrix * uModelTransformationMatrix * vec4(aPosition, 1.0f);
  vColor = aColor;
  
  vColor = aColor;
}