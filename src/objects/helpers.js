function makeSceneObjectGenerator(generatePrimitive) {
  return function genericSceneObjectGenerator(objectName, color = undefined) {

    console.log(...[...arguments].slice(2))
    const { vertices, indices, vertexCount, colors } = generatePrimitive(
      ...[...arguments].slice(2),
    );
    const fillerColors =
      colors == undefined ? generateFillerColors(vertexCount, color) : colors;

    return new SceneObject(objectName, vertices, fillerColors, indices);
  };
}



const generateBarrelObject = makeSceneObjectGenerator(generateBarrel);
const generateConeObject = makeSceneObjectGenerator(generateCone);
const generateSphereObject = makeSceneObjectGenerator(generateSphere);
const generateCylinderObject = makeSceneObjectGenerator(generateCylinder);
const generateGridObject = makeSceneObjectGenerator(generateGrid);