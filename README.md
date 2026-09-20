# CS 512 HW3

Third homework from CS512: Introduction to computer graphics @ UNM fall 2026

Structure has been cleaned up slightly from the provided source so I don't get a headache.

Files of interest to the grader include:
- [transformations.js](./src/transformations.js)
- [src/objects/primitives.js](./src/primitives.js) 
    adds 2+ geometric primitives (circle, cylinder, prism, grid, etc).
- [src/objects/compositions.js](./src/primitives.js) 
    adds 2 composition objects: barrel, raft (combination of multiple primitives)
- [objects.js](./src/objects.js)
    TODO create objects from composition of primitives (barrel, raft)


## Instructions

In this assignment, you will extend the provided hw3.zip below to build your interactive 3D scene.

- [x] Test the provided code. Use the mouse to drag and rotate the object and the keyboard (arrow keys, w and s) to move the camera. (0 pts)

- [x] Define at least two additional geometric primitives (e.g. prism, **cylinder**, **cone**, **sphere**, torus, etc.) and add them into the scene. The more you can do here, the less work needed in the future assignments. (2 pts)

- [ ] Create at least two UI components (e.g. buttons, sliders, or menus, etc.) to trigger events such as selecting objects, changing rotation directions, applying different motions, or inserting new objects, etc. (2 pts)

- [ ] Apply motions to the objects. There have to be at least three different types of transformations from translation, rotation, scaling, shearing/skewing, mirroring/reflection, etc. (3 pts)

- [ ] Outstanding effects and creativities will get 1 bonus points.

## TODO
### Initial scene thoughts
- ocean / sea
    - large grid primitive?
    - vertex shader to make wave motion
        - simple wave function, at least a little better than base sin, cos.
            - can probably just layer a bunch of sin waves 
    - fragment shader for color or just make it blue
    - transparent

- objects
    - raft composed of primitives
    - barrel composed of primitives
    - rain? spheres? think a particle effect makes more sense for this but I don't know how those would work in webgl.
        - if rain, clouds? probably just make sky / background gray and dark so it makes some sense

- skybox? although we dont know textures yet. probably just set the clear color to the background sky color I want.


- is there a extremely simple lighting I can apply, don't want to live with the flat look.


## Development

Setup
```sh
npm i
```

Dev Server
```sh
npm run start
```

Production build
```sh
npm run build
```