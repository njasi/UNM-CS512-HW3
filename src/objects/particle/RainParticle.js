import SceneObject from "../SceneObject";


export class RainParticle extends SceneObject(){
    // TODO just a falling object that deletes itself from the scene
    //      at a given height. let us give it a constant speed so
    //      the calculation is cheap?

    // Would be good if we could do this in a vertex shader since transforming
    // verts, ie translate down in bulk is cheap there.
    // 
    // We can probably layer shader programs? 
    // - have normal shaders
    // - then just for rain particles "rain.vert"?
}