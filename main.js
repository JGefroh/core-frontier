import '@core/component';
import { default as Core } from '@core/core';
import { default as Entity } from './core-js/src/entity.js';
import './core-js/src/tag';

import { default as RenderComponent } from '@game/renderer/render-component';
import { default as RenderOptimizationSystem } from '@game/renderer/render-optimization-system';
import { default as RenderSystem } from '@game/renderer/render-system';
import { default as Renderable } from '@game/renderer/render-tags';

import { default as InputSystem } from '@game/inputter/input-system';
import { default as MovementSystem } from '@game/mover/movement-system';

import { default as CommandComponent } from '@game/commander/command-component';
import { default as CommandSystem } from '@game/commander/command-system';
import { default as Commandable } from '@game/commander/command-tags';

import EntitySystem from '@game/entity-manager/entity-system';

import { default as Moveable } from '@game/mover/movement-tags';


import AudioSystem from '@game/audio/audio-system.js';
import Collidable from '@game/collision/collidable-tag.js';
import CollisionComponent from '@game/collision/collision-component.js';
import CollisionSystem from '@game/collision/collision-system.js';
import Decayable from '@game/decayer/decayable-tag.js';
import DecayerSystem from '@game/decayer/decayer-system.js';
import EngineSystem from '@game/engines/engine-system.js';
import GuiTextComponent from '@game/gui/gui-text-component.js';
import GuiText from '@game/gui/gui-text-tag.js';
import Attached from '@game/mover/attached-tag.js';
import VectorComponent from '@game/mover/vector-component.js';
import { default as PositionComponent } from '@game/positioner/position-component';
import ViewportFollowable from '@game/renderer/viewport-followable-tag.js';
import ViewportSystem from '@game/renderer/viewport-system';
import Selectable from '@game/selector/selectable-tag';
import SelectionComponent from '@game/selector/selection-component';
import SelectionSystem from '@game/selector/selection-system';
import Cursorable from '@game/tracker/cursorable';
import MouseTrackerSystem from '@game/tracker/mouse-tracker-system.js';
import TurnsTowardsSystem from '@game/tracker/turns-towards-system.js';
import TurnsTowards from '@game/tracker/turns-towards-tag.js';
import { toCoordinateUnitsFromMeters } from '@game/utilities/distance-util.js';
import FiringSystem from '@game/weapons/firing-system.js';
import Weapon from '@game/weapons/weapon-tag.js';
import DestructionSystem from '@game/destructions/destruction-system.js';
import ExplosionSystem from '@game/explosions/explosion-system.js';
import Explosion from '@game/explosions/explosion-tag.js';
import AttachedComponent from '@game/mover/attached-component.js';
import Orbiter from '@game/orbiter/orbiter-tag.js';
import OrbitSystem from '@game/orbiter/orbit-system.js';
import OrbitComponent from '@game/orbiter/orbit-component.js';
import GuiCanvasRenderable from '@game/gui/gui-canvas-renderable-tag.js';
import GuiShipStatusSystem from '@game/gui/gui-ship-status-system.js';
import GuiViewportControlsSystem from '@game/gui/gui-viewport-controls-system.js';
import GuiWeaponsSystem from '@game/gui/gui-weapons-system.js';
import GuiManifestSystem from '@game/gui/gui-manifest-system.js';
import GuiTrackingSystem from '@game/gui/gui-tracking-system.js';
import GuiCommandSystem from '@game/gui/gui-command-system.js';
import GuiManifestListable from '@game/gui/gui-manifest-listable.js';
import GuiManifestListingComponent from './game/gui/gui-manifest-listing-component.js';
import TargetSystem from '@game/targeter/target-system.js'


function defineCanvas() {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas");
    let canvasCtx = canvas.getContext("2d");
    document.body.appendChild(canvas);
    document.body.style = 'margin: 0px;'
    canvasCtx.canvas.width  = window.innerWidth;;
    canvasCtx.canvas.height = window.innerHeight;

    var offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.setAttribute("id", "canvas-offscreen");
    let offScreenCanvasCtx = canvas.getContext("2d");
    window.offScreenCanvas = offScreenCanvas;
    offScreenCanvasCtx.canvas.width  = window.innerWidth;;
    offScreenCanvasCtx.canvas.height = window.innerHeight;
}

import '@game/title/asset-loader.js'

defineCanvas();

import '@game/title/title.js'