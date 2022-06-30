---
sidebar_position: 5
title: Combinations
---

It is now time to introduce a way to combine shapes together, the main
operations of constructive geometry, also known as the boolean operations.

We will play with two shapes, a box and a cylinder.

## Pasting shapes together

This is what we call the fuse operation:

```js
const main = ({ sketchCircle, sketchRectangle }) => {
  const cylinder = sketchCircle(20).extrude(50);
  const box = sketchRectangle(60, 90).extrude(25);

  return box.fuse(cylinder);
};
```

![the box and cylinder fused](/img/tutorial/combinations-1.png)

## Cutting one shape with another

This is what we call the cut operation:

```js
const main = ({ sketchCircle, sketchRectangle }) => {
  const cylinder = sketchCircle(20).extrude(50);
  const box = sketchRectangle(60, 90).extrude(25);

  return box.cut(cylinder);
};
```

![the cylinder cut in the box](/img/tutorial/combinations-2.png)

## Intersecting two shapes

For the intersection we will intersect the cylinder with itself you create
a fun shape:

```js
const main = ({ sketchCircle }) => {
  const cylinder = sketchCircle(20).extrude(40);
  const sideCylinder = cylinder.clone().rotate(90, [0, 0, 20], [1, 0, 0]);

  return sideCylinder.intersect(cylinder);
};
```

![the cylinder intersecting iself](/img/tutorial/combinations-3.png)
