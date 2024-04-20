# Frontier


Frontier is a 2D game that takes in space that serves as a tech demo for my `core-js` framework.

It is written in pure Javascript w/ Canvas rendering and no other frameworks.

It's fully playable at http://frontier.jgefroh.com.

This is not intended to be used in a commercial or production environment - it was just a fun hobby project I wrote.


----
# The basics

## Camera and viewport
There are a variety of camera and viewport behaviors demonstrated including:
* User-controlled viewport, including zooming and panning
* "Follow mode" to center and visually track an entity
* "Focus mode" to keep two objects in view, adjusting pan and zoom as objects move.
* A secondary viewport that allows you to re-render using a different perspective and independent viewport configuration

## GUI System
A GUI system exists to render an arbitrary image, shape, or text at any particular canvas location, which can be requested by any system, allowing you to separate GUI components into individual systems.
* Arbitrary GUI element rendering, including images, text, and shape
* Automatic GUI click-handling, with appropriate events
* Dynamically defined and rendered table creation, great for list-based UIs
* On-hover style change behaviors
* Easy way to identify a target element and define an update to it (eg. text, position, visibility, color, etc.)

## User input system
User inputs can be defined on a per-keystroke basis that translates them into particular action events other systems can subscribe to.
* Key-to-action mapping, including press, release, and hold.
* Support for modifier keys like `Shift`.
---
# Game systems
As a space game, there are a variety of systems built.

## Physics
The physics system supports inertial-based movement.
* Sustaind acceleration of an object via application of multiple force vectors
* Travel path prediction based on changes to acceleration, bearing, etc.