import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js';
import { distanceFromTo, toMetersFromCoordinateUnits } from '@game/utilities/distance-util';


import { default as RenderComponent } from '@game/renderer/render-component';
import { default as RenderOverlayComponent } from '@game/renderer/render-overlay-component';


import DetailComponent from '@game/lore/detail-component.js';

import { default as CommandComponent } from '@game/commander/command-component';


import HealthComponent from '@game/damage/health-component.js';


import CollisionComponent from '@game/collision/collision-component.js';
import GuiManifestListingComponent from '@game/gui/gui-manifest-listing-component.js';
import AttachedComponent from '@game/mover/attached-component.js';
import VectorComponent from '@game/mover/vector-component.js';
import OrbitComponent from '@game/orbiter/orbit-component.js';
import { default as PositionComponent } from '@game/positioner/position-component';
import SelectionComponent from '@game/selector/selection-component';
import IffComponent from '@game/iff/iff-component';
import { toCoordinateUnitsFromMeters } from '@game/utilities/distance-util.js';
import PathPredictorComponent from '../tactical/path-predictor-component';
import TargetConfigurationComponent from '../tactical/target-configuration-component';
import AiComponent from '@game/ai/ai-component'
import TargetableComponent from '@game/targeter/targetable-component'
import RelationshipComponent from '../relationships/relationship-component';


export default class ShipCreationSystem extends System {
    constructor() {
      super();

      this.shipsByFaction = {
        'enemy': [],
        'ally': []
      }

      this.ships = {
        'civilian': [
            {imagePath: 'assets/ships/ship-transport-1.png', subtype: 'Torch - Transport', width: 417, height: 192, scale: 0.5},
            {imagePath: 'assets/ships/ship-transport-2.png', subtype: 'Torch - Transport', width: 471, height: 139, scale: 0.5},
            {imagePath: 'assets/ships/ship-traveler-kayak.png', subtype: 'Traveler', width: 477, height: 121, scale: 0.25}
        ],
        'military': [
            {imagePath: 'assets/ships/ship-fighter-1.png', subtype: 'Fighter', width: 464, height: 450, scale: 0.25},
            {imagePath: 'assets/ships/ship-fighter-2.png', subtype: 'Fighter', width: 403, height: 346, scale: 0.25},
        ],
        'military_orbital': [
            {imagePath: 'assets/ships/sattelite-defense-turret.png', subtype: 'Orbital Defense Platform - Short-range Counter-measures'},
            {imagePath: 'assets/ships/odp-1.png', subtype: 'Orbital Defense Platform - Long-range Area Denial'},
        ],
      }

      this.addHandler('CREATE_SHIP', (payload) => {
        this.createShip(payload)
      })

      setTimeout(() => {
        let xNegative = 0;
        let yNegative = 0;
        for (let i = 0; i < 4; i++) {
            let randomX = Math.random() * 3000;
            let randomY = Math.random() * 3000;
            let result1 = Math.random() < 0.5 ? -1 : 1;
            let result2 = Math.random() < 0.5 ? -1 : 1;
            this.send('CREATE_SHIP', {type: 'ally', faction: 'ally', xPosition: randomX * result1, yPosition: randomY * result2})
        }

        for (let i = 0; i < 6; i++) {
            let spawnDistance = 100000;
            if (window.location.href.indexOf('spawnclose') != -1) {
                spawnDistance = 10000
            }
            let randomX = spawnDistance + Math.random() * 1000;
            let randomY = 0 + Math.random() * 1000;
            this.send('CREATE_SHIP', {type: 'enemy', faction:'enemy', xPosition: randomX, yPosition: randomY})
        }

        for (let i = 0; i < 5; i++) {
            let randomX = Math.random() * 20000;
            let randomY = Math.random() * 20000;
            let xNegative = Math.random() < 0.5 ? -1 : 1;
            let yNegative = Math.random() < 0.5 ? -1 : 1;
            this._core.send('CREATE_SHIP', {type: 'civilian', xPosition: randomX * xNegative, yPosition: randomY * yNegative})
        }

        this.generateFrigate()

        this.send('PLAY_AUDIO', {audioKey: 'range-alert.mp3', startAt: 0})
      }, 1000)
    }
    
    work() {
    };

    createShip(payload) {
        if (payload.type == 'civilian') {
            this.generateCivilian(payload)
        }
        else if (payload.type == 'enemy' || payload.type == 'ally') {
            this.generateMilitary(payload)
        }
        else {
        }
    }
    
    
    _generateCallsign() {
        const callsignPrefixes = ["Alpha", "Bravo", "Delta", "Echo", "Foxtrot", "Goliath", "Havoc", "Jupiter", "Kilo", "Lancer"];
        const callsignSuffixes = ["Star", "Blade", "Falcon", "Viper", "Shadow", "Hunter", "Nova", "Striker", "Raptor", "Thunder"];
    
        const randomPrefix = callsignPrefixes[Math.floor(Math.random() * callsignPrefixes.length)];
        const randomSuffix = callsignSuffixes[Math.floor(Math.random() * callsignSuffixes.length)];
    
        return randomPrefix + " " + randomSuffix;
    }
    
    _generateShipName() {
        // List of prefixes and suffixes for ship names
        var prefixes = ['USS', 'HMS', 'SS', 'RMS', 'NS', 'TS', 'SV', 'MV', 'CS'];
        var suffixes = ['Star', 'Galaxy', 'Falcon', 'Voyager', 'Explorer', 'Discovery', 'Enterprise', 'Odyssey', 'Pioneer', 'Endeavour'];

        // Randomly select a prefix and a suffix
        var randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        var randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        // Combine the prefix and suffix to form the ship name
        var shipName = randomPrefix + ' ' + randomSuffix;

        return shipName;
    }

    getRandomElement(array) {
        if (array.length === 0) {
            return undefined;
        }
    
        const randomIndex = Math.floor(Math.random() * array.length);
    
        return array[randomIndex];
    }

    generateCivilian(payload) {
        let vector = new VectorComponent()
        let shipCode =  this._generateRandomCode()
        let ship = this.getRandomElement(this.ships['civilian'])
        let shipName = this._generateShipName()
        let scale = ship.scale || 1
        let shipWidth = ship.width * scale;
        let shipHeight = ship.height * scale
        let distanceFudge = 1000 * Math.random()
        let angle = Math.floor((Math.random() * 360))


        let entity = new Entity({key: `ship-${shipCode}`});
        entity.addComponent(new RenderComponent({ width: shipWidth, height: shipHeight, imagePath: ship.imagePath, renderOverlayColor: 'red' }))
        entity.addComponent(new PositionComponent({ xPosition: payload.xPosition + distanceFudge, yPosition: payload.yPosition + distanceFudge, width: shipWidth, height: shipHeight, bearingDegrees: angle }));
        entity.addComponent(new CommandComponent());
        entity.addComponent(new CollisionComponent({ collisionGroup: 'ship' }));
        // vector.addVector(toCoordinateUnitsFromMeters(Math.random() * 30), angle);
        entity.addComponent(vector);
        entity.addComponent(new SelectionComponent({ label: 'Ship' }));
        entity.addComponent(new GuiManifestListingComponent({typeLabel: 'Civilian', type: 'ship'}))
        entity.addComponent(new RenderOverlayComponent({renderOverlayColor: 'unused'}))
        entity.addComponent(new IffComponent({iff: 'civilian'}))
        entity.addComponent(new HealthComponent({ health: 100 }));
        entity.addComponent(new DetailComponent({
            label: shipName,
            code: shipCode,
            type: 'Ship',
            subtype: ship.subtype
        }));
        entity.addComponent(new PathPredictorComponent({  }));
        entity.addComponent(new TargetConfigurationComponent());
        entity.addComponent(new TargetableComponent());
        entity.addComponent(new RelationshipComponent({nation: 'unn'}));
        
        this._core.addEntity(entity);
    }

    generateMilitary(payload) {
        let vector = new VectorComponent()
        let shipCode =  this._generateRandomCode()
        let ship = this.getRandomElement(this.ships['military'])
        let shipName = this._generateCallsign()
        let scale = ship.scale || 1
        let shipWidth = ship.width * scale;
        let shipHeight = ship.height * scale
        let distanceFudge = 0;
        let angle = Math.random() * 360
        let result1 = Math.random() < 0.5 ? -1 : 1;
        let result2 = Math.random() < 0.5 ? -1 : 1;

        let entity = new Entity({key: `ship-${shipCode}`});
        entity.addComponent(new RenderComponent({ width: shipWidth, height: shipHeight, imagePath: ship.imagePath, renderOverlayColor: null }))
        entity.addComponent(new PositionComponent({ xPosition: payload.xPosition + distanceFudge, yPosition: payload.yPosition + distanceFudge, width: shipWidth, height: shipHeight, bearingDegrees: angle }));
        entity.addComponent(new CommandComponent());
        entity.addComponent(new CollisionComponent({ collisionGroup: 'ship' }));
        vector.addVector(50, 180)
        entity.addComponent(vector);
        entity.addComponent(new SelectionComponent({ label: 'Ship' }));
        entity.addComponent(new GuiManifestListingComponent({typeLabel: 'Fighter', type: `ship_${payload.type}`}))
        entity.addComponent(new RenderOverlayComponent({renderOverlayColor: 'unused'}))
        entity.addComponent(new HealthComponent({ health: 50 }));
        entity.addComponent(new IffComponent({iff: payload.type}))
        entity.addComponent(new DetailComponent({
            label: shipName,
            code: shipCode,
            type: 'Ship',
            subtype: ship.subtype,
            shortDescription: "A short-range, terrestial-launched fighter primarily used for orbital defense, armed with missiles and a heavy machine gun."
        }));
        entity.addComponent(new PathPredictorComponent({  }));
        entity.addComponent(new TargetConfigurationComponent({showFlightPath: false}));
        entity.addComponent(new TargetableComponent());
        this._core.addEntity(entity);
        this.shipsByFaction[payload.type].push(entity.id)
        this.send('REQUEST_ADD_WEAPON', {entityId: entity.id, weaponKey: 'machinegun'})
        this.send('REQUEST_ADD_WEAPON', {entityId: entity.id, weaponKey: 'missile'})

        setTimeout(() => {
            if (payload.type == 'ally') {
                entity.addComponent(new AiComponent());
                entity.addComponent(new RelationshipComponent({nation: 'unn', faction: 'military'}));
                // this.send('COMMAND_ATTACK', {commandedEntityId: entity.id, targetedEntityId: this.getRandomFrom(this.shipsByFaction['enemy']) })
            }
            else {
                entity.addComponent(new AiComponent());
                entity.addComponent(new RelationshipComponent({nation: 'plutarch', faction: 'military'}));
                if (Math.floor(Math.random() * 5) % 5 == 0) {
                    // this.send('COMMAND_ATTACK', {commandedEntityId: entity.id, targetedEntityId: playerEntity.id })
                }
                else {
                    // this.send('COMMAND_ATTACK', {commandedEntityId: entity.id, targetedEntityId: this.getRandomFrom(this.shipsByFaction['ally']) })
                }
            }
        }, 300)
        
        this.send('TRACK_ENTITY_REQUESTED', {entityId: entity.id})
    }

    generateFrigate() {
        let entity = new Entity({key: '12941'});
        entity.addComponent(new RenderComponent({ width: 300, height: 94, imagePath: 'assets/ships/ship-corvette-stingray.png', renderOverlayColor: 'rgba(0,255,0,0.4)' }))
        entity.addComponent(new RenderOverlayComponent({renderOverlayColor: 'unused'}))
        entity.addComponent(new PositionComponent({ xPosition: 300, yPosition: 400, width: 300, height: 94 }));
        entity.addComponent(new HealthComponent({ health: 1000 }));
        entity.addComponent(new CollisionComponent({ collisionGroup: 'ship' }));
        entity.addComponent(new AiComponent());
        entity.addComponent(new RelationshipComponent({ nation: 'unn', faction: 'military' }));
        entity.addComponent(new GuiManifestListingComponent({typeLabel: 'Frigate', type: 'ship'}))
        entity.addComponent(new PathPredictorComponent({  }));
        entity.addComponent(new TargetConfigurationComponent({showFlightPath: false}));
    
        entity.addComponent(new DetailComponent({
            label: 'Hammer',
            code: 'LL-9',
            type: 'Ship',
            subtype: 'Frigate',
            shortDescription: "A heavily armd UNN frigate."
        }));
        let playerVector = new VectorComponent({ })
        entity.addComponent(playerVector);
        entity.addComponent(new IffComponent({iff: 'ally'}))

        // this._core.addEntity(entity);
        // this._core.send('TRACK_ENTITY_REQUESTED', {entityId: entity.id})
        // this.send('REQUEST_ADD_WEAPON', {entityId: entity.id, weaponKey: 'machinegun'})
        // this.send('REQUEST_ADD_WEAPON', {entityId: entity.id, weaponKey: 'missile'})
        // this.send('REQUEST_ADD_WEAPON', {entityId: entity.id, weaponKey: 'pdc'})
        // this.send('REQUEST_ADD_WEAPON', {entityId: entity.id, weaponKey: 'pdc'})
        // this.send('REQUEST_ADD_WEAPON', {entityId: entity.id, weaponKey: 'pdc'})
        // this.send('REQUEST_ADD_WEAPON', {entityId: entity.id, weaponKey: 'pdc'})
        // this.send('REQUEST_ADD_WEAPON', {entityId: entity.id, weaponKey: 'railgun'})
    }

    getRandomFrom(array) {
        return array[Math.floor(Math.random() * array.length)]
    }

    _generateRandomCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const codeLength = 3;
        let code = '';

        for (let i = 0; i < 2; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        code += ' '
        
        for (let i = 0; i < 4; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        code += '-'

        for (let i = 0; i < 3; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return code;
    }
}