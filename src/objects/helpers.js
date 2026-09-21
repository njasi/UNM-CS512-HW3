import SceneObject from "./SceneObject"

import {
  generateBarrel,
} from "./compositions";

import {
  generateCone,
  generateCylinder,
  generateGrid,
  generateNGonPrism,
  generateSphere,
  generateFillerColors
} from "./primitives"

/**
 * Helper function that turns a primitive
 * generator into a SceneObject generator
 * @param {function} generatePrimitive
 * @returns {SceneObject}
 */
export function makeSceneObjectGenerator(generatePrimitive) {
  return function genericSceneObjectGenerator(objectName, color = undefined) {
    const { vertices, indices, vertexCount, colors } = generatePrimitive(
      ...[...arguments].slice(2),
    );
    const fillerColors =
      colors == undefined ? generateFillerColors(vertexCount, color, true) : colors;

    return new SceneObject(
      objectName,
      new Float32Array(vertices),
      new Float32Array(fillerColors),
      new Uint16Array(indices),
    );
  };
}

/**
 * Generate a Parametric (kinda) Barrel
 * one cylinder as main body
 *  - the barrel body should be low to get the
 *    look of individual staves for free
 * 4 cylinders for the binding rings
 *
 * @param {*} name the name of the object
 * @param {*} color the color the object should have
 * @param {*} segments how many z-axis divisions there are
 * @param {*} r the radius of the base of the barrel
 * @param {*} h the height of the barrel
 * @param {*} x_c x coord of the center of the cylinder
 * @param {*} y_c y coord of the center of the cylinder
 * @param {*} z_c z coord of the center of the cylinder
 * @param {*} bulge the amount of bulge the barrel has
 * @returns
 */
export const generateBarrelObject = makeSceneObjectGenerator(generateBarrel);

/**
 * Generate a cone
 * @param {*} name the name of the object
 * @param {*} color the color the object should have
 * @param {*} segments how many divisions there are
 * @param {*} r the radius of the base of the cone
 * @param {*} h the height of the cone
 * @param {*} x_c x coord of the center of the cylinder
 * @param {*} y_c y coord of the center of the cylinder
 * @param {*} z_c z coord of the center of the cylinder
 * @param {*} solid if the bottom of the cone should be closed
 * @returns
 */
export const generateConeObject = makeSceneObjectGenerator(generateCone);

/**
 * Generate a sphere object
 * @param {*} segments how many divisions there are
 * @param {*} r the radius of the sphere
 * @param {*} x_c x coord of the center of the cylinder
 * @param {*} y_c y coord of the center of the cylinder
 * @param {*} z_c z coord of the center of the cylinder
 * @returns
 */
export const generateSphereObject = makeSceneObjectGenerator(generateSphere);

/**
 * Generate a "Cylinder" object
 * @param {*} name the name of the object
 * @param {*} color the color the object should have
 * @param {*} segments how many divisions there are
 * @param {*} r radius of the cylinder
 * @param {*} h height of the cylinder
 * @param {*} x_c x coord of the center of the cylinder
 * @param {*} y_c y coord of the center of the cylinder
 * @param {*} z_c z coord of the center of the cylinder
 * @param {*} bulge amount of "bulge" the cylinder should have
 * @param {*} solid if false, do not close the ends of the cylinder
 * @param {*} segments_h, how many divisions there are along the z axis
 * @returns
 */
export const generateCylinderObject =
  makeSceneObjectGenerator(generateCylinder);

/**
 * Generate a square grid centered on the origin
 * @param {*} name the name of the object
 * @param {*} color the color the object should have
 * @param {*} segments
 * @param {*} size
 * @param {*} x_c x coord of the center of the cylinder
 * @param {*} y_c y coord of the center of the cylinder
 * @param {*} z_c z coord of the center of the cylinder
 */
export const generateGridObject = makeSceneObjectGenerator(generateGrid);

/**
 * Generate a n-gon prism
 * @param {*} name the name of the object
 * @param {*} color the color the object should have
 * @param {*} n the amount of sides on the n-gon
 * @param {*} r the radius of the circle the n-gon can be inscribed in
 * @param {*} h the hight of the prism
 * @param {*} x_c x coord of the center of the cylinder
 * @param {*} y_c y coord of the center of the cylinder
 * @param {*} z_c z coord of the center of the cylinder
 * @returns
 */
export const generateNGonPrismObject =
  makeSceneObjectGenerator(generateNGonPrism);
