import { default as Tag } from '@core/tag'

export default class Weapon extends Tag{
  static tagType = 'Weapon'

    constructor() {
        super()
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('WeaponComponent');
    };

    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    }

    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    }

    getOwningEntity() {
      return this.entity.getComponent('AttachedComponent')?.attachedToEntity
    }

    belongsToEntity(entityId) {
      return this.entity.getComponent('AttachedComponent')?.attachedToEntity?.id == entityId;
    }

    setFireRequested(isFireRequested) {
      this.entity.getComponent('WeaponComponent').fireRequested = isFireRequested;
    }

    getFireRequested(fireRequested) {
      return this.entity.getComponent('WeaponComponent').fireRequested;
    }

    getWeaponKey() {
      return this.entity.getComponent('WeaponComponent').weaponKey;
    }

    isUsingInventory() {
      return this.getOwningEntity()?.getComponent('InventoryComponent');
    }

    getCurrentAmmunition() {
      if (this.isUsingInventory()) {
        return this.getOwningEntity()?.getComponent('InventoryComponent')?.getCount(this.getLoadedAmmoItemId()) || 0;
      }
      else {
        return this.entity.getComponent('WeaponComponent').currentAmmunition;
      }
    }

    getLoadedAmmoItemId() {
      if (this.isUsingInventory()) {
        return this.entity.getComponent('WeaponComponent').loadedAmmoItemId;
      }
    }

    getLastFired() {
      return this.entity.getComponent('WeaponComponent').lastFired;
    }

    setLastFired(time) {
      this.entity.getComponent('WeaponComponent').lastFired = time
    }

    decrementCurrentAmmunition() {
      if (this.isUsingInventory()) {
        this.getOwningEntity()?.getComponent('InventoryComponent')?.adjustItem(this.getLoadedAmmoItemId(), -1);
      }
      else {
        this.entity.getComponent('WeaponComponent').currentAmmunition--;
      }
    }

    getBearingDegrees() {
      return this.entity.getComponent('PositionComponent').bearingDegrees;
    }

    getWeaponGroup() {
      return this.entity.getComponent('WeaponComponent').weaponGroup;
    }

    incrementWeaponGroup() {
      if (this.entity.getComponent('WeaponComponent').weaponGroup >= 9) {
        this.entity.getComponent('WeaponComponent').weaponGroup = 1;
      }
      else {
        this.entity.getComponent('WeaponComponent').weaponGroup += 1;
      }
    }
  }
  