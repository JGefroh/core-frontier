import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'

import { default as RenderComponent } from '@game/renderer/render-component'
import { default as PositionComponent } from '@game/positioner/position-component'
import GuiTextComponent from '@game/gui/gui-text-component.js';
import VectorComponent from '@game/mover/vector-component.js';
import CollisionComponent from '@game/collision/collision-component.js';
import { notYetTime } from '@game/utilities/timing-util.js'
import AttachedComponent from '@game/mover/attached-component.js';
import Attached from '@game/mover/attached-tag.js';
import DecayerComponent from '@game/decayer/decayer-component';
import TurnsTowardsComponent from '@game/tracker/turns-towards-component.js';
import TurnsTowards from '@game/tracker/turns-towards-tag.js';
import WeaponComponent from '@game/weapons/weapon-component';
import RenderOverlayComponent from '@game/renderer/render-overlay-component';
import DetailComponent from '@game/lore/detail-component.js'
import GuiManifestListingComponent from '@game/gui/gui-manifest-listing-component.js';
import AiComponent from '@game/ai/ai-component'

import { angleTo, toFriendlyMeters, distanceFromTo, toMetersFromCoordinateUnits, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';


export default class WeaponSystem extends System {
    constructor() {
      super()

      this.timesPerSecond = 60;
      this.setToSelectedWeaponGroup = null;
      this.selectedWeaponGroup = 1;

      this.weapons = {
        'pdc': {
          key: 'pdc',
          name: 'Vulcan Mk.IV Defender',
          type: 'PDC',
          shotsPerMinute: 700,
          ammunitionType: 'continuous',
          maxAmmunition: 1000,
          shotSpeedMetersPerSecond: 400,
          bulletWidth: 4,
          bulletHeight: 4,
          width: 32,
          height: 32,
        },
        'railgun': {
          key: 'railgun',
          name: 'Jacobs Mk.II Railgun',
          type: 'RAL',
          shotsPerMinute: 10,
          ammunitionType: 'continuous',
          maxAmmunition: 100,
          shotSpeedMetersPerSecond: 2000,
          bulletWidth: 8,
          bulletHeight: 32,
          width: 32,
          height: 32,
        },
        'machinegun': {
          key: 'machinegun',
          name: 'Bravo Gatling',
          type: 'HMG',
          shotsPerMinute: 500,
          ammunitionType: 'continuous',
          maxAmmunition: 1000,
          shotSpeedMetersPerSecond: 900,
          bulletWidth: 16,
          bulletHeight: 16,
          width: 16,
          height: 16,
        },
        'homing_missile': {
          key: 'homing_missile',
          name: 'Speartip Mk.VII',
          type: 'HMG',
          shotsPerMinute: 360,
          ammunitionType: 'continuous',
          maxAmmunition: 300,
          shotSpeedMetersPerSecond: 5000,
          bulletWidth: 32,
          bulletHeight: 8,
        },
        'missile': {
          key: 'missile',
          name: 'Osiris Mk.IX',
          type: 'MSL',
          shotsPerMinute: 360,
          ammunitionType: 'reload',
          maxMagazine: 10,
          maxAmmunition: 50,
          shotSpeedMetersPerSecond: 1300,
          bulletWidth: 26,
          bulletHeight: 6,
        }
      }

      this.weaponStates = {
        'pdc': {
          lastFired: null,
          currentAmmunition: 1000,
          shouldFire: false,
        },
        'homing-missile': {
          lastFired: null,
          currentAmmunition: 300,
          shouldFire: false,
        },
        'missile': {
          lastFired: null,
          currentAmmunition: 300,
          shouldFire: false,
        },
      }

      this.addHandler('INPUT_RECEIVED', (payload) => {
        if (payload.action && payload.action.indexOf('ADJUST_WEAPON_GROUP_') != -1) {
          this.updateWeaponGroup(parseInt(payload.action.split('ADJUST_WEAPON_GROUP_')[1]))
        }

        if (payload.action && payload.action.indexOf('weapon_group_') != -1) {
          this.selectedWeaponGroup = parseInt(payload.action.split('_')[2])
          this.workForTag('Weapon', (tag, entity) => {
            let playerEntity = this._core.getKeyedAs('PLAYER')
            if (!tag.belongsToEntity(playerEntity.getId())) {
              return;
            }
            tag.setFireRequested(false);
            if (tag.getWeaponGroup() == this.selectedWeaponGroup) {
              tag.setFireRequested(payload.action.indexOf('stop') === -1);
            }
          });
        }
      });

      this.addHandler('REQUEST_ADD_WEAPON', (payload) => {
        this.addWeapon(payload.entityId, payload.weaponKey)
      });

      this.addHandler('REQUEST_FIRE_WEAPON', (payload) => {
        this.fireWeapon(payload.entityId, payload.weaponKey, payload.fireRequested, payload.xPosition, payload.yPosition);
      });


      setTimeout(() => {
        let playerEntity = this._core.getKeyedAs('PLAYER')
        this._addWeaponsToPlayer(playerEntity, this.weapons.pdc)
      }, 100)
    }

    addWeapon(entityId, weaponKey) {
      let tag = this.getTag('Weapon');
      let parentEntity = this._core.getEntityWithId(entityId);
      let weapon = this.weapons[weaponKey]

      let entity = new Entity({key: `weapon-${entityId}-${weaponKey}`});
      entity.addComponent(new RenderComponent({ width: weapon.width, height: weapon.height, imagePath: 'assets/weapons/pdc.png', renderColor: 'rgba(0,0,0,0)' }))
      entity.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: weapon.width, height: weapon.height, bearingDegrees: 90 }));
      entity.addComponent(new AttachedComponent({ attachedToEntity: parentEntity, sync: ['xPosition', 'yPosition', 'bearingDegrees'], attachmentOptions: {xPosition: 0, yPosition: 0}}));
      entity.addComponent(new WeaponComponent({weaponKey: weaponKey, currentAmmunition: 1000}))
      this._core.addEntity(entity);
    }

    fireWeapon(entityId, weaponKey, fireRequested) {
      this.workForTag('Weapon', (tag, entity) => {
        if (!tag.belongsToEntity(entityId)) {
          return;
        }
        if (tag.getWeaponKey() == weaponKey) {
          tag.setFireRequested(fireRequested);
        }
      });
    }

    _calculateBulletMath(weapon) {
      return {
        magnitude: toCoordinateUnitsFromMeters(weapon.shotSpeedMetersPerSecond),
        timesPerSecond: (weapon.shotsPerMinute / 60),
      }
    }

    fireHomingMissile(weaponTag, weapon, toXPosition, toYPosition) {
    }


    fireRailgun(weaponTag, weapon, toXPosition, toYPosition) {
      let bulletMath = this._calculateBulletMath(weapon)
      if (notYetTime(bulletMath.timesPerSecond, weaponTag.getLastFired())) {
        return;
      }
      if (weaponTag.getCurrentAmmunition() <= 0) {
        return;
      }
      let xPosition = weaponTag.getXPosition();
      let yPosition = weaponTag.getYPosition();

      let entity = new Entity();
      let firingEntity = weaponTag.getOwningEntity();
      if (!firingEntity) {
        return;
      }

      let firingEntityVector = firingEntity.getComponent('VectorComponent').calculateTotalVector();
      let vector = new VectorComponent();
      vector.addVector(firingEntityVector.magnitude, firingEntityVector.angleDegrees)
      vector.addVectorUsingDeltas(toXPosition - xPosition,toYPosition - yPosition, bulletMath.magnitude)
      entity.addComponent(vector);
      entity.addComponent(new RenderComponent({ width: weapon.bulletWidth, height: weapon.bulletHeight, imagePath: 'assets/missile.png', renderOverlayColor: 'rgba(255,255,255,1)' }))
      entity.addComponent(new PositionComponent({ xPosition: xPosition, yPosition: yPosition, width: weapon.width, height: weapon.height, bearingDegrees: 0 }));
      entity.addComponent(new CollisionComponent({ collisionGroup: 'railgun_shot' }));
      entity.addComponent(new RenderOverlayComponent({ overlayShape: 'triangle' }));
      entity.addComponent(firingEntity.getComponent('RelationshipComponent'))
      entity.addComponent(new DetailComponent({
        label: 'Slug',
        code: 'RLG',
        type: 'Conventional',
        subtype: 'Projectile'
      }));

      this._core.addEntity(entity);

      this.send('PLAY_AUDIO', {audioKey: 'railgun.mp3', startAt: 19.15})
      weaponTag.setLastFired(Date.now());
      weaponTag.decrementCurrentAmmunition();
      weaponTag.setFireRequested(false)
    }

    fireMissile(weaponTag, weapon, toXPosition, toYPosition, ownerType) {
      let bulletMath = this._calculateBulletMath(weapon)
      if (notYetTime(ownerType == 'enemy' ? 0.05 : bulletMath.timesPerSecond, weaponTag.getLastFired())) {
        return;
      }

      if (weaponTag.getCurrentAmmunition() <= 0) {
        return;
      }

      let xPosition = weaponTag.getXPosition();
      let yPosition = weaponTag.getYPosition();

      let entity = new Entity();
      let firingEntity = weaponTag.getOwningEntity();
      if (!firingEntity) {
        return;
      }
      let firingEntityVector = firingEntity.getComponent('VectorComponent').calculateTotalVector();
      let vector = new VectorComponent();
      vector.addVector(firingEntityVector.magnitude, firingEntityVector.angleDegrees)
      vector.addVectorUsingDeltas(100, 90)
      entity.addComponent(new RenderComponent({ width: weapon.bulletWidth, height: weapon.bulletHeight, imagePath: 'assets/missile.png', renderOverlayColor: 'rgba(255,255,255,1)' }))
      entity.addComponent(new PositionComponent({ xPosition: xPosition, yPosition: yPosition, width: weapon.bulletWidth, height: weapon.bulletHeight, bearingDegrees: 0 }));
      entity.addComponent(vector);
      entity.addComponent(new CollisionComponent({ collisionGroup: ownerType == 'enemy' ? 'enemy_missile' : 'missile' }));
      entity.addComponent(new RenderOverlayComponent({ overlayShape: 'triangle' }))

      entity.addComponent(new DetailComponent({
          label: `Missile`,
          code: `MSL`,
          type: 'Conventional',
          subtype: 'Homing'
      }));

      entity.addComponent(new GuiManifestListingComponent({typeLabel: 'MSL', type: 'enemy_projectile'}))
      entity.addComponent(firingEntity.getComponent('RelationshipComponent'))

      entity.addComponent(new DecayerComponent({ decayIn: 500, onDecayEffect: () => {
        let position = entity.getComponent('PositionComponent')
        entity.getComponent('VectorComponent').removeAllVectors();
        entity.getComponent('VectorComponent').addVectorUsingDeltas(toXPosition - position.xPosition, toYPosition - position.yPosition, bulletMath.magnitude)
        entity.getComponent('VectorComponent').setAccelerationMagnitude(100)
        entity.getComponent('PositionComponent').bearingDegrees = entity.getComponent('VectorComponent').calculateTotalVector().angleDegrees

        let engine = new Entity({key: "plume"});
        let width = 26; let height = 6;
        engine.addComponent(new RenderComponent({ width: width, height: height, imagePath: 'assets/effects/flame.png' }))
        engine.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: width, height: height }));
        engine.addComponent(new AttachedComponent({ attachedToEntity: entity, sync: ['xPosition', 'yPosition', 'bearingDegrees'], attachmentOptions: {xPosition: -22, yPosition: 0}}));

        this._core.addEntity(engine);
      }}));


      this._core.addEntity(entity);

      if (ownerType != 'enemy') {
        this.send('PLAY_AUDIO', {audioKey: 'woosh.mp3', startAt: 0.4})
      }

      weaponTag.setLastFired(Date.now());
      weaponTag.decrementCurrentAmmunition();
      weaponTag.setFireRequested(false)
    }

    firePdc(weaponTag, weapon, toXPosition, toYPosition, ownerType) {
        let bulletMath = this._calculateBulletMath(weapon);
        if (notYetTime(bulletMath.timesPerSecond, weaponTag.getLastFired())) {
          return;
        }

        if (weaponTag.getCurrentAmmunition() <= 0) {
          return;
        }

        let xPosition = weaponTag.getXPosition();
        let yPosition = weaponTag.getYPosition(); 
        let firingEntity = weaponTag.getOwningEntity();
        if (!firingEntity || !firingEntity.getComponent('VectorComponent')) {
          return;
        }
        let firingEntityVector = firingEntity.getComponent('VectorComponent').calculateTotalVector();
        let entity = new Entity();
        let vector = new VectorComponent();
        vector.addVector(firingEntityVector.magnitude, firingEntityVector.angleDegrees)
        vector.addVector(bulletMath.magnitude, weaponTag.getBearingDegrees())
        entity.addComponent(new RenderComponent({ width: weapon.bulletWidth, height: weapon.bulletHeight, imagePath: 'assets/bullet.jpeg', renderColor: 'rgba(0,0,0,0)'}))
        entity.addComponent(new PositionComponent({ xPosition: xPosition, yPosition: yPosition, width: weapon.bulletWidth, height: weapon.bulletHeight }));
        entity.addComponent(vector);
        let collision = new CollisionComponent({ collisionGroup: 'shot' })
        entity.addComponent(collision);
        entity.addComponent(new DecayerComponent({ decayIn: 3000 }));
        entity.addComponent(new RenderOverlayComponent({ overlayShape: 'triangle' }))
        entity.addComponent(firingEntity.getComponent('RelationshipComponent'))

        this._core.addEntity(entity);

        if (ownerType != 'enemy') {
          this.send('PLAY_AUDIO', {audioKey: 'minigun.mp3', exclusive: true, startAt: 1, endAt: 6})
        }


        weaponTag.setLastFired(Date.now());
        weaponTag.decrementCurrentAmmunition();
        weaponTag.setFireRequested(false)
    }
  
    work() {
      if (notYetTime(this.timesPerSecond, this.lastRanTimestamp)) {
        return true;
      }

      this.firePlayerWeapons();
      this.fireOtherWeapons();
    };

    fireOtherWeapons() {
      this.workForTag('Weapon', (tag, entity) => {
        let playerEntity = this._core.getKeyedAs('PLAYER')

        if (tag.belongsToEntity(playerEntity?.getId())) {
          return;
        }
        if (!playerEntity) {
          return;
        }

        if (!tag.getFireRequested()) {
          return;
        }

        if (tag.getWeaponKey() === 'pdc' || tag.getWeaponKey() == 'machinegun') {
          let position = playerEntity.getComponent('PositionComponent')
          this.firePdc(tag, this.weapons[tag.getWeaponKey()], position.xPosition, position.yPosition, 'enemy')
        }
        else if (tag.getWeaponKey() === 'missile') {
          let position = playerEntity.getComponent('PositionComponent')
          this.fireMissile(tag, this.weapons[tag.getWeaponKey()], position.xPosition, position.yPosition, 'enemy')
        }
      });
    }

    firePlayerWeapons() {
      let playerCoordinates = this._core.getData('PLAYER_COORDINATES')
      let cursorCoordinates = this._core.getData('CURSOR_COORDINATES')
      if (!playerCoordinates || !cursorCoordinates) {
        return;
      }

      let index = 1;

      this.workForTag('Weapon', (tag, entity) => {
        let playerEntity = this._core.getKeyedAs('PLAYER')
        if (!playerEntity) {
          return;
        }
        if (!tag.belongsToEntity(playerEntity.getId())) {
          return;
        }
        if (this.selectedWeaponGroup && this.selectedWeaponGroup != tag.getWeaponGroup()) {
          tag.setFireRequested(false)
          return;
        }

        if (!tag.getFireRequested()) {
          this.send('STOP_AUDIO', {audioKey: 'minigun.mp3'})
          return;
        }

        if (tag.getWeaponKey() === 'pdc') {
          this.firePdc(tag, this.weapons[tag.getWeaponKey()], cursorCoordinates.world.xPosition, cursorCoordinates.world.yPosition)
        }
        else if (tag.getWeaponKey() === 'missile') {
          this.fireMissile(tag, this.weapons[tag.getWeaponKey()], cursorCoordinates.world.xPosition, cursorCoordinates.world.yPosition)
        }
        else if (tag.getWeaponKey() === 'homing_missile') {
          this.fireHomingMissile(tag, this.weapons[tag.getWeaponKey()], cursorCoordinates.world.xPosition, cursorCoordinates.world.yPosition)
        }
        else if (tag.getWeaponKey() === 'railgun') {
          this.fireRailgun(tag, this.weapons[tag.getWeaponKey()], cursorCoordinates.world.xPosition, cursorCoordinates.world.yPosition)
        }
        let weapon = this.weapons[tag.getWeaponKey()]
        this._sendGuiData(tag, entity, weapon)
      });

    }

    _sendGuiData(tag, entity, weapon) {
      this.send('GUI_DATA',{
        key: `weapons-panel-label-weapon-type-${entity.getId()}`, 
        value: `${weapon.type}` 
      })
      this.send('GUI_DATA',{
          key: `weapons-panel-label-weapon-name-${entity.getId()}`, 
          value: `${weapon.name}` 
      })
      this.send('GUI_DATA',{
          key: `weapons-panel-button-weapon-group-${entity.getId()}`, 
          value: `${tag.getWeaponGroup()}` 
      })
      this.send('GUI_DATA',{
          key: `gui-weapon-ammunition`, 
          value: {entityId: entity.getId(), currentAmmunition: tag.getCurrentAmmunition(), maxAmmunition: this.weapons[tag.getWeaponKey()].maxAmmunition} 
      })
    }

    _addWeaponsToPlayer(parentEntity, weapon) {
      let weapons = []
      let tag = this.getTag('Weapon');
      let entity = new Entity({key: 'weapon-1'});
      entity.addComponent(new RenderComponent({ width: weapon.width, height: weapon.height, imagePath: 'assets/weapons/pdc.png', renderColor: 'rgba(0,0,0,0)' }))
      entity.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: weapon.width, height: weapon.height }));
      entity.addComponent(new AttachedComponent({ attachedToEntity: parentEntity, sync: ['xPosition', 'yPosition', 'bearingDegrees'], attachmentOptions: {xPosition: -60, yPosition: -40, bearingDegrees: -135}}));
      entity.addComponent(new WeaponComponent({weaponKey: 'pdc', currentAmmunition: 1000, loadedAmmoItemId: 1000}))
      this._core.addEntity(entity);

      let entity2 = new Entity({key: "weapon-2"});
      entity2.addComponent(new RenderComponent({ width: weapon.width, height: weapon.height, imagePath: 'assets/weapons/pdc.png' , renderColor: 'rgba(0,0,0,0)'}))
      entity2.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: weapon.width, height: weapon.height }));
      entity2.addComponent(new AttachedComponent({ attachedToEntity: parentEntity,sync: ['xPosition', 'yPosition', 'bearingDegrees'], attachmentOptions: {xPosition: -60, yPosition: 40, bearingDegrees: 135}}));
      entity2.addComponent(new WeaponComponent({weaponKey: 'pdc', currentAmmunition: 1000, loadedAmmoItemId: 1000}))
      this._core.addEntity(entity2);
      
      let entity5 = new Entity({key: 'weapon-5'});
      entity5.addComponent(new RenderComponent({ width: weapon.width, height: weapon.height, imagePath: 'assets/weapons/pdc.png', renderColor: 'rgba(0,0,0,0)' }))
      entity5.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: weapon.width, height: weapon.height }));
      entity5.addComponent(new AttachedComponent({ attachedToEntity: parentEntity, sync: ['xPosition', 'yPosition', 'bearingDegrees'], attachmentOptions: {xPosition: 60, yPosition: -40, bearingDegrees: -45}}));
      entity5.addComponent(new WeaponComponent({weaponKey: 'pdc', currentAmmunition: 1000, loadedAmmoItemId: 1000}))
      this._core.addEntity(entity5);

      let entity6 = new Entity({key: "weapon-6"});
      entity6.addComponent(new RenderComponent({ width: weapon.width, height: weapon.height, imagePath: 'assets/weapons/pdc.png' , renderColor: 'rgba(0,0,0,0)'}))
      entity6.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: weapon.width, height: weapon.height }));
      entity6.addComponent(new AttachedComponent({ attachedToEntity: parentEntity,sync: ['xPosition', 'yPosition', 'bearingDegrees'], attachmentOptions: {xPosition: 60, yPosition: 40, bearingDegrees: 45}}));
      entity6.addComponent(new WeaponComponent({weaponKey: 'pdc', currentAmmunition: 1000, loadedAmmoItemId: 1000}))
      this._core.addEntity(entity6);

      let entity3 = new Entity({key: "weapon-3"});
      entity3.addComponent(new RenderComponent({ width: weapon.width, height: weapon.height, imagePath: 'assets/weapons/pdc.png' , renderColor: 'rgba(0,0,0,0)'}))
      entity3.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: weapon.width, height: weapon.height }));
      entity3.addComponent(new AttachedComponent({ attachedToEntity: parentEntity,sync: ['xPosition', 'yPosition'],  attachmentOptions: {xPosition: 0, yPosition: 0}}));
      entity3.addComponent(new TurnsTowardsComponent({ turnSpeed: 3}));
      entity3.addComponent(new WeaponComponent({weaponKey: 'missile', currentAmmunition: 50, weaponGroup: 2, loadedAmmoItemId: 1002}))
      this._core.addEntity(entity3);

      let entity4 = new Entity({key: "weapon-4"});
      entity4.addComponent(new RenderComponent({ width: weapon.width, height: weapon.height, imagePath: 'assets/weapons/pdc.png' , renderColor: 'rgba(0,0,0,0)'}))
      entity4.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: weapon.width, height: weapon.height }));
      entity4.addComponent(new AttachedComponent({ attachedToEntity: parentEntity,sync: ['xPosition', 'yPosition'],  attachmentOptions: {xPosition: 0, yPosition: 0}}));
      entity4.addComponent(new WeaponComponent({weaponKey: 'railgun', currentAmmunition: 50, weaponGroup: 3, loadedAmmoItemId: 1001}))
      this._core.addEntity(entity4);

      weapons.push(entity)
      weapons.push(entity2)
      weapons.push(entity5)
      weapons.push(entity6)
      weapons.push(entity3)
      weapons.push(entity4)

      this.send('PLAYER_WEAPONS_UPDATED', {weapons: weapons})

      tag.setEntity(entity)
      this._sendGuiData(tag, entity, this.weapons[tag.getWeaponKey()])
      tag.setEntity(entity2)
      this._sendGuiData(tag, entity2, this.weapons[tag.getWeaponKey()])
      tag.setEntity(entity3)
      this._sendGuiData(tag, entity3, this.weapons[tag.getWeaponKey()])
      tag.setEntity(entity4)
      this._sendGuiData(tag, entity4, this.weapons[tag.getWeaponKey()])
      tag.setEntity(entity5)
      this._sendGuiData(tag, entity5, this.weapons[tag.getWeaponKey()])
      tag.setEntity(entity6)
      this._sendGuiData(tag, entity6, this.weapons[tag.getWeaponKey()])
    }

    updateWeaponGroup(entityId) {
      let tag = this.getTag('Weapon');
      let entity = this._core.getEntityWithId(entityId)
      tag.setEntity(entity)
      tag.incrementWeaponGroup();
      this.send('GUI_DATA',{
          key: `weapons-panel-button-weapon-group-${entity.getId()}`, 
          value: `${tag.getWeaponGroup()}` 
      })
    }
  }
  