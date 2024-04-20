# Frontier


Frontier is a 2D game that takes in space that serves as a tech demo for my [core-js](https://github.com/jgefroh/core-js) framework.

It is written in pure Javascript w/ Canvas rendering and no other frameworks.

It's fully playable at http://frontier.jgefroh.com.

This is not intended to be used in a commercial or production environment - it was just a fun hobby project I wrote.

----
# Screenshots

<img width="2043" alt="Screenshot 2024-04-19 at 7 07 34 PM" src="https://github.com/JGefroh/core-frontier/assets/1077095/74ef86c0-b3ae-4e99-8cef-3f1e0658694e">
<img width="2037" alt="Screenshot 2024-04-19 at 7 08 14 PM" src="https://github.com/JGefroh/core-frontier/assets/1077095/eb8135b0-6e8b-4f0b-99ce-dd53409c4c97">
<img width="2010" alt="Screenshot 2024-04-19 at 7 13 18 PM" src="https://github.com/JGefroh/core-frontier/assets/1077095/e76e1151-eff7-4906-b3bb-9d19db35ba5a">

-----
# Instructions
* Movement
  * W - Increase thrust
  * S - Decrease thrust
  * A - Turn left
  * D - Turn right
* Weapons
  * 1 - Fire Weapon Group 1
  * 2 - Fire Weapon Group 2
  * 3 - Fire Weapon Group 3
* Combat
  * \ - Toggle tactical mode
  * Tab - Next target
  * ShiftTab - Previous target
  * V - View target
  * T - Focus target
* Camera
  * Left arrow - Move viewport left
  * Right arrow - Move viewport right
  * Up arrow - Move viewport up
  * Down arrow - Move viewport down
  * + Zoom in
  * - Zoom out
* Misc
  * I - View inventory

------
# Instructions

Install packages
```
npm install
```

Development server (127.0.0.1:9000)
```
npx webpack serve
```

Production build (assets must be moved manually into `dist` folder.
```
NODE_ENV=production npx webpack build
```

------

# The basics

## Audio
Audio is merely an event that passes a message to play a specific sound starting at a specific time.

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

## AI
AIs work with a goal-based system that lets you define a top-level goal and have the AI (theoretically) select what tactics and actions to use to approach that goal. Action are scored based on importance, and then the steps of that action are executed in sequence to complete the action.

## Collision
Collision is 2d collision system allowing for rotated rectangle collision checks. Collidable entities are defined as with a collision group, informed by an entity's association to a nation for gameplay purposes.

## Physics
The physics system supports inertial-based movement.
* Sustaind acceleration of an object via application of multiple force vectors
* Travel path prediction based on changes to acceleration, bearing, etc.

# Gameplay systems

## Weapons
Weapons are in the firing system. Different weapons have different stats, but they are all basic, continuous fire with a firing cooldown between shots.

## Relationships
Relationships are defined in terms of Nations and Factions. These then inform whether they can be targeted by other nations, as well as the collision system.

