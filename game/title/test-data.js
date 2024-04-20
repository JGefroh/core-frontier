import '@core/component';
import { default as Core } from '@core/core';
import { default as Entity } from '@core/entity.js';
import '@core/tag';

import '@game/title/asset-loader.js';
import '@game/title/title.js';


import { default as RenderComponent } from '@game/renderer/render-component';
import { default as RenderOverlayComponent } from '@game/renderer/render-overlay-component';


import DetailComponent from '@game/lore/detail-component.js';

import { default as CommandComponent } from '@game/commander/command-component';
import TargetableComponent from '@game/targeter/targetable-component'




import CollisionComponent from '@game/collision/collision-component.js';
import GuiManifestListingComponent from '@game/gui/gui-manifest-listing-component.js';
import AttachedComponent from '@game/mover/attached-component.js';
import VectorComponent from '@game/mover/vector-component.js';
import IffComponent from '@game/iff/iff-component.js';
import OrbitComponent from '@game/orbiter/orbit-component.js';
import InventoryComponent from '@game/inventory/inventory-component.js';
import HealthComponent from '@game/damage/health-component.js';
import { default as PositionComponent } from '@game/positioner/position-component';
import SelectionComponent from '@game/selector/selection-component';
import { toCoordinateUnitsFromMeters } from '@game/utilities/distance-util.js';
import PathPredictorComponent from '../tactical/path-predictor-component';
import TargetConfigurationComponent from '../tactical/target-configuration-component';
import RelationshipComponent from '@game/relationships/relationship-component';

function _getRelativePlanets() {
    let planets = {
        // 'mercury': {
        //     meters: 4880000,
        //     au: 0.39,
        //     imageWidth: 2048,
        //     imageHeight: 2048
        // },
        'earth': {
            meters: 4880000,
            au: 1.0,
            imageWidth: 2048,
            imageHeight: 2048
        },
        'mercury': {
            meters: 4880000,
            au: 0.0000001,
            imageWidth: 2048,
            imageHeight: 2048
        },
        'venus': {
            meters: 12104000,
            au: 0.72,
            imageWidth: 2048,
            imageHeight: 2048
        },
        'mars': {
            meters: 6779000,
            au: 1.52,
            imageWidth: 225,
            imageHeight: 225
        },
        'jupiter': {
            meters: 139820000,
            au: 5.20,
            imageWidth: 2048,
            imageHeight: 1152
        },
        'saturn': {
            meters: 116460000,
            au: 9.58,
            imageWidth: 1638,
            imageHeight: 2048
        },
        'uranus': {
            meters: 50724000,
            au: 19.22,
            imageWidth: 2048,
            imageHeight: 1280
        },
        'neptune': {
            meters: 49244000,
            au: 30.05,
            imageWidth: 2048,
            imageHeight: 1152
        }
    }
    return planets;
}



function createHighway() {
}

function addPlanets() {
    let planets = _getRelativePlanets()
    let auMeters =  149600000000 
    Object.keys(planets).forEach((key) => {
        let planet = planets[key]
        let entity = new Entity({key: key});///0.00000000197
        let xPosition = toCoordinateUnitsFromMeters(auMeters * planet.au);
        let orbitRadius = -10000
        let orbitXPosition = xPosition
        if (key == 'earth') {
            xPosition = 0
            orbitRadius = -10000
            orbitXPosition = -9000
        }
        let label = key.charAt(0).toUpperCase() + key.slice(1) 
        entity.addComponent(new RenderComponent({  width: planet.imageWidth * 3, height: planet.imageHeight * 3, imagePath: `assets/planets/${key}.png`, renderShape: 'circle'}))
        entity.addComponent(new PositionComponent({ xPosition: xPosition, yPosition: 0, width: planet.imageWidth * 3, height: planet.imageHeight * 3 }));
        entity.addComponent(new OrbitComponent({orbitRadius: orbitRadius, orbitCompletionTime: 60*60*24, orbitXPosition: orbitXPosition, orbitYPosition: 0, startAngle: 3.15}));
        entity.addComponent(new GuiManifestListingComponent({typeLabel: 'Planet', type: 'planet'}))

        entity.addComponent(new RenderOverlayComponent({ overlayShape: 'circle' }))
        entity.addComponent(new DetailComponent({
            label: label,
            code: 'United Nations',
            type: 'Planet',
            subtype: 'Habitable'
        }));
        Core.addEntity(entity);
    });
}

function addPlayer() {
    let entity = new Entity({key: 'PLAYER'});
    entity.addComponent(new RenderComponent({ width: 300, height: 94, imagePath: 'assets/ships/ship-corvette-stingray.png', renderOverlayColor: 'rgba(0,255,0,0.4)' }))
    entity.addComponent(new RenderOverlayComponent({ renderOverlayColor: 'rgba(0,255,0,0.4)' }))
    entity.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: 300, height: 94 }));
    entity.addComponent(new CommandComponent());
    entity.addComponent(new HealthComponent({ health: 1000 }));
    entity.addComponent(new CollisionComponent({ collisionGroup: 'ship' }));
    entity.addComponent(new RelationshipComponent({ nation: 'unn', faction: 'military' }));
    entity.addComponent(new GuiManifestListingComponent({typeLabel: 'Player', type: 'ship'}))
    entity.addComponent(new PathPredictorComponent({  }));
    entity.addComponent(new TargetConfigurationComponent({showFlightPath: true}));

    entity.addComponent(new DetailComponent({
        label: 'Osiris',
        code: 'JGL-472',
        type: 'Ship',
        subtype: 'Frigate',
        shortDescription: "Your ship, which you've owned for several years."
    }));
    let playerVector = new VectorComponent({ })
    entity.addComponent(playerVector);
    entity.addComponent(new IffComponent({iff: 'player'}))
    entity.addComponent(new TargetableComponent());

    let inventory = new InventoryComponent({});
    entity.addComponent(inventory)
    inventory.adjustItem(1000, 1000)
    inventory.adjustItem(1001, 50)
    inventory.adjustItem(1002, 20)
    inventory.adjustItem(2000, 500)
    inventory.adjustItem(2001, 10)
    inventory.adjustItem(2002, 10)
    inventory.adjustItem(2003, 10)
    Core.addEntity(entity);

    let engine = new Entity({key: "engine"});
    engine.addComponent(new RenderComponent({ width: 120, height: 50, imagePath: 'assets/effects/flame.png',  renderColor: 'rgba(0,0,0,0)' }))
    engine.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: 120, height: 50 }));
    engine.addComponent(new AttachedComponent({ attachedToEntity: entity, sync: ['xPosition', 'yPosition', 'bearingDegrees'], attachmentOptions: {xPosition: -210, yPosition: 0, bearingDegrees: 0}}));
    Core.addEntity(engine);


    let leftTopEngine = new Entity({key: "left-top-engine"});
    leftTopEngine.addComponent(new RenderComponent({ width: 120, height: 50, imagePath: 'assets/effects/stream-air.png',  renderColor: 'rgba(0,0,0,0)'}))
    leftTopEngine.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: 120, height: 50 }));
    leftTopEngine.addComponent(new AttachedComponent({ attachedToEntity: entity, sync: ['xPosition', 'yPosition', 'bearingDegrees'], attachmentOptions: {xPosition: 80, yPosition: -70, bearingDegrees: -90}}));
    Core.addEntity(leftTopEngine)

    let leftBottomEngine = new Entity({key: "left-bottom-engine"});
    leftBottomEngine.addComponent(new RenderComponent({ width: 120, height: 50, imagePath: 'assets/effects/stream-air.png',  renderColor: 'rgba(0,0,0,0)' }))
    leftBottomEngine.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: 120, height: 50 }));
    leftBottomEngine.addComponent(new AttachedComponent({ attachedToEntity: entity, sync: ['xPosition', 'yPosition', 'bearingDegrees'], attachmentOptions: {xPosition: -80, yPosition: -70, bearingDegrees: -90}}));
    Core.addEntity(leftBottomEngine)

    let rightTopEngine = new Entity({key: "right-top-engine"});
    rightTopEngine.addComponent(new RenderComponent({ width: 120, height: 50, imagePath: 'assets/effects/stream-air.png' ,  renderColor: 'rgba(0,0,0,0)'}))
    rightTopEngine.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: 120, height: 50 }));
    rightTopEngine.addComponent(new AttachedComponent({ attachedToEntity: entity, sync: ['xPosition', 'yPosition', 'bearingDegrees'], attachmentOptions: {xPosition: 80, yPosition: 70, bearingDegrees: 90}}));
    Core.addEntity(rightTopEngine)

    let rightBottomEngine = new Entity({key: "right-bottom-engine"});
    rightBottomEngine.addComponent(new RenderComponent({ width: 120, height: 50, imagePath: 'assets/effects/stream-air.png' ,  renderColor: 'rgba(0,0,0,0)'}))
    rightBottomEngine.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: 120, height: 50 }));
    rightBottomEngine.addComponent(new AttachedComponent({ attachedToEntity: entity, sync: ['xPosition', 'yPosition', 'bearingDegrees'], attachmentOptions: {xPosition: -80, yPosition: 70, bearingDegrees: 90}}));
    Core.addEntity(rightBottomEngine)

    Core.send('TRACK_ENTITY_REQUESTED', {entityId: entity.id})
}

export function createTestData() {
    addPlanets();
    addPlayer();
    createHighway();
}
