import '@core/component';
import { default as Core } from '@core/core';
import '@core/tag';

import '@game/title/asset-loader.js';
import '@game/title/title.js';


import { default as RenderOptimizationSystem } from '@game/renderer/render-optimization-system';
import { default as RenderSystem } from '@game/renderer/render-system';
import { default as Renderable } from '@game/renderer/render-tags';

import { default as InputSystem } from '@game/inputter/input-system';
import { default as MovementSystem } from '@game/mover/movement-system';

import { default as CommandSystem } from '@game/commander/command-system';
import { default as Commandable } from '@game/commander/command-tags';

import EntitySystem from '@game/entity-manager/entity-system';

import { default as Moveable } from '@game/mover/movement-tags';


import AudioSystem from '@game/audio/audio-system.js';
import Collidable from '@game/collision/collidable-tag.js';
import CollisionSystem from '@game/collision/collision-system.js';
import Decayable from '@game/decayer/decayable-tag.js';
import DecayerSystem from '@game/decayer/decayer-system.js';
import DestructionSystem from '@game/destructions/destruction-system.js';
import EngineSystem from '@game/engines/engine-system.js';
import ExplosionSystem from '@game/explosions/explosion-system.js';
import Explosion from '@game/explosions/explosion-tag.js';
import GuiCanvasRenderable from '@game/gui/gui-canvas-renderable-tag.js';
import GuiCommandSystem from '@game/gui/gui-command-system.js';
import GuiManifestListable from '@game/gui/gui-manifest-listable.js';
import GuiManifestSystem from '@game/gui/gui-manifest-system.js';
import GuiMapSystem from '@game/gui/gui-map-system.js';
import GuiShipStatusSystem from '@game/gui/gui-ship-status-system.js';
import GuiSystem from '@game/gui/gui-system.js';
import GuiText from '@game/gui/gui-text-tag.js';
import GuiTrackingSystem from '@game/gui/gui-tracking-system.js';
import GuiViewportControlsSystem from '@game/gui/gui-viewport-controls-system.js';
import GuiWeaponsSystem from '@game/gui/gui-weapons-system.js';
import IffSystem from '@game/iff/iff-system.js';
import Iff from '@game/iff/iff-tag.js';
import Attached from '@game/mover/attached-tag.js';
import OrbitSystem from '@game/orbiter/orbit-system.js';
import Orbiter from '@game/orbiter/orbiter-tag.js';
import ViewportFollowable from '@game/renderer/viewport-followable-tag.js';
import ViewportSystem from '@game/renderer/viewport-system';
import Selectable from '@game/selector/selectable-tag';
import SelectionSystem from '@game/selector/selection-system';
import TargetSystem from '@game/targeter/target-system.js';
import Targetable from '@game/targeter/targetable-tag.js';
import Cursorable from '@game/tracker/cursorable';
import MouseTrackerSystem from '@game/tracker/mouse-tracker-system.js';
import TurnsTowardsSystem from '@game/tracker/turns-towards-system.js';
import TurnsTowards from '@game/tracker/turns-towards-tag.js';
import WaypointSystem from '@game/waypoints/waypoint-system.js';
import FiringSystem from '@game/weapons/firing-system.js';
import Weapon from '@game/weapons/weapon-tag.js';

import DamageSystem from '@game/damage/damage-system.js';
import GuiInventorySystem from '@game/gui/gui-inventory-system.js';
import GuiRadarSystem from '@game/gui/gui-radar-system.js';
import { createTestData } from '@game/title/test-data.js';
import ShipCreationSystem from '../ship-manager/ship-creation-system';
import PathPredictorSystem from '../tactical/path-predictor-system';
import PathPredictor from '../tactical/path-predictor-tag';
import TargetConfigurationSystem from '../tactical/target-configuration-system';

import AiSystem from '@game/ai/ai-system';
import Ai from '@game/ai/ai-tag';

export function startGame() {
    Core.addTag(Commandable)
    Core.addTag(Renderable)
    Core.addTag(GuiCanvasRenderable)
    Core.addTag(Moveable)
    Core.addTag(Cursorable)
    Core.addTag(TurnsTowards)
    Core.addTag(Collidable)
    Core.addTag(GuiText)
    Core.addTag(ViewportFollowable)
    Core.addTag(Selectable);
    Core.addTag(Decayable);
    Core.addTag(Attached);
    Core.addTag(Weapon);
    Core.addTag(Iff);
    Core.addTag(Explosion);
    Core.addTag(Orbiter)
    Core.addTag(GuiManifestListable)
    Core.addTag(PathPredictor)
    Core.addTag(Targetable)
    Core.addTag(Ai)

    // Core systems
    Core.addSystem(new ViewportSystem())
    Core.addSystem(new RenderSystem({secondaryScreen: true}))
    Core.addSystem(new GuiSystem());
    Core.addSystem(new AudioSystem())

    
    // Game Systems
    Core.addSystem(new EngineSystem());
    Core.addSystem(new MovementSystem())
    Core.addSystem(new FiringSystem()) // Before the movement system in the stack so that
    Core.addSystem(new OrbitSystem())
    Core.addSystem(new MouseTrackerSystem());
    Core.addSystem(new TurnsTowardsSystem())
    Core.addSystem(new RenderOptimizationSystem())
    Core.addSystem(new InputSystem())
    Core.addSystem(new CommandSystem())
    Core.addSystem(new CollisionSystem())
    Core.addSystem(new TargetSystem());
    Core.addSystem(new EntitySystem())
    
    Core.addSystem(new SelectionSystem())
    Core.addSystem(new DecayerSystem())
    Core.addSystem(new DestructionSystem());
    Core.addSystem(new ExplosionSystem());
    Core.addSystem(new OrbitSystem());
    Core.addSystem(new WaypointSystem());
    Core.addSystem(new IffSystem());
    Core.addSystem(new DamageSystem());
    Core.addSystem(new ShipCreationSystem());
    Core.addSystem(new PathPredictorSystem());
    Core.addSystem(new TargetConfigurationSystem());
    
    // GUI
    Core.addSystem(new GuiShipStatusSystem());
    Core.addSystem(new GuiViewportControlsSystem());
    Core.addSystem(new GuiWeaponsSystem());
    Core.addSystem(new GuiManifestSystem());
    Core.addSystem(new GuiTrackingSystem());
    Core.addSystem(new GuiCommandSystem());
    Core.addSystem(new GuiMapSystem());
    Core.addSystem(new GuiRadarSystem());
    Core.addSystem(new GuiInventorySystem());

    Core.addSystem(new AiSystem());
    
    Core.start();

    createTestData();
}