import { default as System } from '@core/system';
import { areRectanglesColliding, isPointInRotatedRect } from '../utilities/collision-util';

export default class CollisionSystem extends System {
    constructor() {
      super()

      this.collidables = {
        'none': ['none'],
        'shot': ['ship'],
        'missile': ['ship'],
        'railgun_shot': ['ship', 'missile']
      }

      this.addHandler('SET_CONFIG_COLLISION_GROUP', (payload) => {
        this.collidables = payload
      })

    }
  
    work() {
      this.checkCount = 0;
      let collidablesByCollisionGroup = this.getAndCacheCollidables();
      this.checkCollisionBetweenGroups(collidablesByCollisionGroup, 'shot', 'ship');
      this.checkCollisionBetweenGroups(collidablesByCollisionGroup, 'railgun_shot', 'ship');
      this.checkCollisionBetweenGroups(collidablesByCollisionGroup, 'railgun_shot', 'missile');
      this.checkCollisionBetweenGroups(collidablesByCollisionGroup, 'missile', 'ship');
      this.checkCollisionBetweenGroups(collidablesByCollisionGroup, 'missile', 'shot');
    };

    getAndCacheCollidables() {
      let collidablesByCollisionGroup = {}
      this.workForTag('Collidable', (tag, entity) => {

        if (!collidablesByCollisionGroup[tag.getCollisionGroup()]) {
          collidablesByCollisionGroup[tag.getCollisionGroup()] = []
        }

        collidablesByCollisionGroup[tag.getCollisionGroup()].push(entity)
      });

      return collidablesByCollisionGroup;
    }

    checkCollisionBetweenGroups(collidablesByCollisionGroup, groupName1, groupName2) {
      let shot = this.getTag('Collidable');
      let target = this.getTag('Collidable');

      (collidablesByCollisionGroup[groupName1] || []).forEach((entity) => {
        shot.setEntity(entity);
        let skipRemainder = false;
        (collidablesByCollisionGroup[groupName2] || []).forEach((entity2) => {
          if (skipRemainder) {
            return;
          }
          target.setEntity(entity2)
          
          if (this._checkShouldCheck(shot, target) && this._checkCollided(shot, target)) {
            this.executeCollisionEffect(shot, target)
            skipRemainder = true;
            return
          }
        });
      });
    }

    executeCollisionEffect(collidable1, collidable2) {
      if (collidable1.getCollisionGroup() == 'shot') {
          this.send('ENTITY_DESTROY_REQUESTED', {entityId: collidable1.getId()})
          this.send('DAMAGE', {entityId: collidable2.getId(), damage: 20})
          this.send('PLAY_AUDIO', {audioKey: 'metal-hit.mp3'})
          if (collidable2.getCollisionGroup() == 'enemy_missile') {
            this.send("EXPLOSION_EFFECT_REQUESTED", {entityId: collidable1.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
            this.send("DESTRUCTION_EFFECT_REQUESTED", {entityId: collidable2.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
            this.send('ENTITY_DESTROY_REQUESTED', {entityId: collidable2.getId()})
          }
          else if (Math.floor(Math.random() * 10) == 2) {
            this.send("EXPLOSION_EFFECT_REQUESTED", {entityId: collidable1.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
            this.send("DESTRUCTION_EFFECT_REQUESTED", {entityId: collidable2.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
          } 
          
      }
      else if (collidable1.getCollisionGroup() == 'missile') {
        this.send("EXPLOSION_EFFECT_REQUESTED", {entityId: collidable1.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
        this.send("DESTRUCTION_EFFECT_REQUESTED", {entityId: collidable2.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
        this.send('ENTITY_DESTROY_REQUESTED', {entityId: collidable1.getId()})
        this.send('DAMAGE', {entityId: collidable2.getId(), damage: 50})
        this.send('PLAY_AUDIO', {audioKey: 'explosion.mp3'})
      }
      else if (collidable2.getCollisionGroup() == 'missile') {
        this.send("EXPLOSION_EFFECT_REQUESTED", {entityId: collidable1.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
        this.send('ENTITY_DESTROY_REQUESTED', {entityId: collidable2.getId()})
        this.send('DAMAGE', {entityId: collidable1.getId(), damage: 50})
        this.send('PLAY_AUDIO', {audioKey: 'explosion.mp3'})
      }
      else if (collidable1.getCollisionGroup() == 'enemy_shot') {
        this.send('ENTITY_DESTROY_REQUESTED', {entityId: collidable1.getId()})
        this.send('DAMAGE', {entityId: collidable2.getId(), damage: 30})

        if (Math.floor(Math.random() * 3) == 1) {
          this.send('PLAY_AUDIO', {audioKey: 'metal-hit.mp3'})
        } 
        if (Math.floor(Math.random() * 100) == 2) {
          this.send("EXPLOSION_EFFECT_REQUESTED", {entityId: collidable1.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
          this.send("DESTRUCTION_EFFECT_REQUESTED", {entityId: collidable2.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
        } 
      }
      else if (collidable1.getCollisionGroup() == 'enemy_missile') {
        this.send('ENTITY_DESTROY_REQUESTED', {entityId: collidable1.getId()})
        this.send('DAMAGE', {entityId: collidable2.getId(), damage: 50})
        this.send('PLAY_AUDIO', {audioKey: 'metal-hit.mp3'})
        this.send("EXPLOSION_EFFECT_REQUESTED", {entityId: collidable1.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
        this.send("DESTRUCTION_EFFECT_REQUESTED", {entityId: collidable2.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
        this.send('PLAY_AUDIO', {audioKey: 'explosion.mp3'})
        if (collidable2.getCollisionGroup() == 'shot') {
          this.send('ENTITY_DESTROY_REQUESTED', {entityId: collidable2.getId()})
        }
      }
      else if (collidable1.getCollisionGroup() == 'railgun_shot') {
        this.send('DAMAGE', {entityId: collidable2.getId(), damage: 100})
        this.send("DESTRUCTION_EFFECT_REQUESTED", {entityId: collidable2.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
        this.send("EXPLOSION_EFFECT_REQUESTED", {entityId: collidable1.getId(), xPosition: collidable2.getXPosition(), yPosition: collidable2.getYPosition()});
        this.send('PLAY_AUDIO', {audioKey: 'metal-hit.mp3'})
      }
      else {
        this.send("DESTRUCTION_EFFECT_REQUESTED", {entityId: collidable1.getId(), xPosition: collidable1.getXPosition(), yPosition: collidable1.getYPosition()});
        this.send('ENTITY_DESTROY_REQUESTED', {entityId: collidable1.getId()})
      }
    }

    _checkShouldCheck(collidable1, collidable2) {
      if (collidable1.getId() == collidable2.getId()) {
        return false; // Can't collidate with yourself
      }

      if (!collidable1.getEntity() || !collidable2.getEntity()) {
        return false; // Don't need to check deleted entities
      }
      if (!collidable1.getIsEnemy(collidable2.getEntity())) {
        return false;
      }

      if (!this.collidables[collidable1.getCollisionGroup() || 'default'].includes(collidable2.getCollisionGroup() || 'default')) {
        return false; // Don't need to check for unknown collision groups.
      }

      let maxDelta = Math.max(collidable1.getWidth(), collidable1.getHeight(), collidable2.getWidth(), collidable2.getHeight())

      if (Math.abs(collidable1.getXPosition() - collidable2.getXPosition()) > maxDelta
          && Math.abs(collidable1.getYPosition() - collidable2.getYPosition()) > maxDelta) {
            return false // Objects are nowhere near each other.
      }

      return true
    }

    _checkCollided(collidable1, collidable2) {
      try {
        let result= areRectanglesColliding(
          collidable1.getXPosition(), 
          collidable1.getYPosition() - (collidable1.getHeight() / 2), 
          collidable1.getWidth(),
          collidable1.getHeight(),
          collidable1.getBearingDegrees(),
          collidable2.getXPosition() - (collidable2.getWidth() / 2), 
          collidable2.getYPosition() - (collidable2.getHeight() / 2), 
          collidable2.getWidth(),
          collidable2.getHeight(),
          collidable2.getBearingDegrees(),
          collidable1.getEntity().key,
          collidable2.getEntity().key
      );
      this.checkCount++;

        // if (result) {
          // this.send("HIT_EFFECT_REQUESTED", {entityId: collidable1.getId(), xPosition: collidable1.getXPosition(), yPosition: collidable1.getYPosition()});
        // }
        return result;

      }
      catch {
        // Strange bug due to out of order deletion of entities
        return false;
      }
    }
  }
  