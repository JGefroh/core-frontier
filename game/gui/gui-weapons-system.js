import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'

import GuiTextComponent from '@game/gui/gui-text-component.js';
import GuiText from '@game/gui/gui-text-tag.js';
import PositionComponent from '@game/positioner/position-component'
import { isPointInRotatedRect } from '../utilities/collision-util';

export default class GuiWeaponsSystem extends System {
    constructor() {
      super()

      this._addUIHandlers();

    }

    _addUIHandlers() {
        this.addHandler('GUI_DATA', (payload) => {
          if (payload.key == 'gui-weapon-ammunition') {
            this._updateWeaponPips(payload.value)
          }
          else {
            this.send('GUI_UPDATE_TEXT', payload)
          }
        });

        this.addHandler('PLAYER_WEAPONS_UPDATED', (payload) => {
          this._addWeaponsDisplay(payload);
        });
        
        this.addHandler('UI_CLICKED', (payload) => {
          if (payload.key.indexOf('button-weapon-group') != -1) {
            const regex = /\d+/;
            const match = payload.key.match(regex);
            let entityId = parseInt(match[0], 10)
            this.send("INPUT_RECEIVED", { type: 'action', action: `ADJUST_WEAPON_GROUP_${entityId}`});
          }
        })
    }


    /** 
     * Weapons Display Panel
     *  
     **/

    _addWeaponsDisplay(payload) {
      let numWeapons = payload.weapons.length;
      this._addWeaponPanel(numWeapons);
      for (let i = 1; i <= numWeapons; i++) {
        this._addWeaponLine(payload.weapons[i - 1], i);
      }
    }

    _addWeaponPanel(numWeapons) {
      this.send('ADD_GUI_RENDERABLE', {
        key: 'weapons-panel',
        width: 320,
        height: numWeapons * 65,
        xPosition: 4,
        yPosition: 18,
        fillStyle: '#031424',
        text: 'WEAPONS STATUS',
        textOffsetY: 8,
        textOffsetX: 8
      });
    }

    _addWeaponLine(weaponEntity, weaponNumber) {
        let size = 22;
        let lineMargin = 24 * ( weaponNumber - 1);

        let xPosition = 16;
        let yPosition = 54;

        let yOffset = yPosition + ((weaponNumber - 1)* size) + lineMargin
        let entityId = weaponEntity.getId()

        this.send('ADD_GUI_RENDERABLE', {
          key: `weapons-panel-button-weapon-group-${entityId}`,
          width: 34,
          height: 34,
          xPosition: xPosition,
          yPosition: yOffset,
          fontSize: 22,
          text: '#',
          textOffsetX: 11,
          textOffsetY: 6
        })
        this.send('ADD_GUI_RENDERABLE', {
          key: `weapons-panel-label-weapon-type-${entityId}`,
          width: 34,
          height: 34,
          xPosition: xPosition + 40,
          yPosition: yOffset,
          fontSize: 12,
          text: 'TYP',
          textOffsetX: 0,
          textOffsetY: 0,
          strokeStyle: 'rgba(0,0,0,0)'
        })
        this.send('ADD_GUI_RENDERABLE', {
          key: `weapons-panel-label-weapon-name-${entityId}`,
          width: 200,
          height: 34,
          xPosition: xPosition + 69,
          yPosition: yOffset,
          fontSize: 12,
          text: 'WEAPON',
          textOffsetX: 0,
          textOffsetY: 0,
          strokeStyle: 'rgba(0,0,0,0)'
        })

        this.send('ADD_GUI_RENDERABLE', {
          key: `weapons-panel-ammo-panel-${entityId}`,
          width: 255,
          height: 16,
          xPosition: xPosition + 40,
          yPosition: yOffset + 15,
          fillStyle: '#031424',
          strokeStyle: '#96d1e3'
        })

        this._addWeaponPips(entityId, yOffset, xPosition)
    }

    _addWeaponPips(entityId, yOffset, xPosition) {
      let pipOMargin = 2;
      let pipWidth = 10;
      let pipCount = 25
      for(let i = 0; i < pipCount; i++) {
        this.send('ADD_GUI_RENDERABLE', {
          key: `weapons-panel-ammo-panel-ammo-pip-${i + 1}-${entityId}`,
          width: 8,
          height: 12,
          xPosition: xPosition + 40 + (pipWidth * i) + 2,
          yPosition: yOffset + 18,
          strokeStyle: '#031424'
        })
      }
    }

    _updateWeaponPips(payload) {
      let entityId = payload.entityId;
      let pipCount = 25;
      let pipSize = Math.ceil(payload.maxAmmunition / pipCount);
      let colorAmmoUsedDanger = 'rgb(146,102,124)';
      let colorAmmoUsed = 'rgb(103,117,145)';
      let colorAmmoRemaining = 'rgb(224,216,225)';

      for(let i = 1; i <= pipCount; i++) {
        let color = null;
        if (Math.min(i * pipSize, payload.maxAmmunition) <= payload.currentAmmunition) {
          color = colorAmmoRemaining;
        }
        else {
          if (i <= 5) {
            color = colorAmmoUsedDanger;
          }
          else {
            color = colorAmmoUsed
          }
        }
        let key = `weapons-panel-ammo-panel-ammo-pip-${i}-${entityId}`;
        this.send("GUI_UPDATE_PROPERTIES", { key: key, value: { fillStyle: color} })
      }
    }


    work() {
    };
  }
  
  