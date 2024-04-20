import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'

import { angleTo, toFriendlyMeters, distanceFromTo, toCoordinateUnitsFromMeters, toMetersFromCoordinateUnits } from '@game/utilities/distance-util';

export default class GuiManifestSystem extends System {
    constructor() {
      super()
      this.currentFilter = 'threats'
      this.wait = 50
      this.initialY = 650;

      setTimeout(() => {
        this._addManifestPanel()
      }, 100)

      this.addHandler('UI_CLICKED', (payload) => {
        if (payload.key.indexOf('button-filter') != -1) {
          this.currentFilter = payload.key.split('button-filter-')[1]
        }
        if (payload.key.indexOf('manifest-panel-list-line-') != -1) {
          this.identifyAndSendEntityId(payload.key)
        }
      })

      this.addHandler('INPUT_RECEIVED', (payload) => {
        if (payload.action == 'next_secondary') {
          this.selectRow('secondary', 'next');
        }
        else if (payload.action == 'previous_secondary') {
          this.selectRow('secondary', 'previous');
        }

        if (payload.action == 'view_primary') {
          this.selectRow('primary', 'current')
        }
      });
    }

    work() {
      this.manifestList = [];
      let playerEntity = this._core.getKeyedAs('PLAYER')

      if (!playerEntity) {
        return;
      }
      let playerXPosition = playerEntity.getComponent('PositionComponent').xPosition
      let playerYPosition = playerEntity.getComponent('PositionComponent').yPosition
      this.workForTag('GuiManifestListable', (tag, entity) => {
        if (this._shouldFilterOut(tag.getType())) {
          return;
        }

        let result = {
          entityId: entity.id,
          label: tag.getLabel(),
          typeLabel: tag.getTypeLabel(),
          type: tag.getType() || '',
          distanceTo: distanceFromTo(playerXPosition, playerYPosition, tag.getXPosition(), tag.getYPosition()),
          bearingTo: angleTo(playerXPosition, playerYPosition, tag.getXPosition(), tag.getYPosition()),
          renderColor: tag.getRenderColor()
        }

        if (result.type == 'planet' || result.distanceTo < 100000) {
          this.manifestList.push(result);
        }

      });

        this.manifestList = this._sortManifestList(this.manifestList)
        this._updateManifestList(this.manifestList)
    };

    _addManifestPanel() {
      let viewport = this._core.getData('VIEWPORT');

      this.send('ADD_GUI_RENDERABLE', {
        key: 'manifest-panel',
        width: 320,
        height: 290,
        xPosition: viewport.width - 324,
        yPosition: this.initialY - 300,
        text: 'Scanner',
        textOffsetY: 8,
        textOffsetX: 8,
        fontSize: 18
      });
      this.send('ADD_GUI_RENDERABLE', {
        key: 'manifest-panel-label',
        xPosition: viewport.width - 315,
        yPosition: this.initialY - 270,
        text: '5000km range',
        fontSize: 10
      });
      this.send('ADD_GUI_RENDERABLE', {
        key: 'manifest-panel-button-filter-poi',
        width: 50,
        height: 20,
        xPosition: viewport.width - 60,
        yPosition: this.initialY - 293,
        text: 'POI',
        textOffsetY: 3,
        textOffsetX: 7
      });
      this.send('ADD_GUI_RENDERABLE', {
        key: 'manifest-panel-button-filter-ship',
        width: 50,
        height: 20,
        xPosition: viewport.width - 114,
        yPosition: this.initialY - 293,
        text: 'Ships',
        textOffsetY: 3,
        textOffsetX: 7
      });
      this.send('ADD_GUI_RENDERABLE', {
        key: 'manifest-panel-button-filter-threats',
        width: 55,
        height: 20,
        xPosition: viewport.width - 173,
        yPosition: this.initialY - 293,
        text: 'Threats',
        textOffsetY: 3,
        textOffsetX: 3
      });
      this._addManifestList(viewport);
    }

    _addManifestList(viewport) {
      let rowBottomMargin = 5;
      let listTopMargin = 60;
      let rowHeight = 20;
      for(let row = -1; row < 10; row++) {
        if (row != -1) {
          this.send('ADD_GUI_RENDERABLE', {
            key: `manifest-panel-list-line-${row}`,
            width: 320,
            height: rowHeight,
            xPosition: viewport.width- 324,
            yPosition: (this.initialY - 300) + listTopMargin + (row * rowHeight) + rowBottomMargin,
            textOffsetX: 6,
            textOffsetY: 4,
            hoverStyles: {
              fillStyle: 'green'
            }
          });
        }
        this.send('ADD_GUI_RENDERABLE', {
          key: `manifest-panel-list-line-${row}-label`,
          width: 320,
          height: rowHeight,
          xPosition: viewport.width - 324,
          yPosition: (this.initialY  - 300) + listTopMargin + (row * rowHeight) + rowBottomMargin,
          textOffsetX: 6,
          textOffsetY: 4,
          fillStyle: 'rgba(0,0,0,0)',
          strokeStyle: 'rgba(0,0,0,0)',
          text: row == -1 ? 'Entity' : null
        });
        this.send('ADD_GUI_RENDERABLE', {
          key: `manifest-panel-list-line-${row}-bearing`,
          width: 320,
          height: rowHeight,
          xPosition: viewport.width - 210,
          yPosition: (this.initialY - 300) + listTopMargin + (row * rowHeight) + rowBottomMargin,
          textOffsetX: 6,
          textOffsetY: 4,
          fillStyle: 'rgba(0,0,0,0)',
          strokeStyle: 'rgba(0,0,0,0)',
          text: row == -1 ? 'Bearing' : null
        });
        this.send('ADD_GUI_RENDERABLE', {
          key: `manifest-panel-list-line-${row}-type`,
          width: 50,
          height: rowHeight,
          xPosition: viewport.width - 140,
          yPosition: (this.initialY - 300) + listTopMargin + (row * rowHeight) + rowBottomMargin,
          textOffsetX: 6,
          textOffsetY: 4,
          fillStyle: 'rgba(0,0,0,0)',
          strokeStyle: 'rgba(0,0,0,0)',
          text: row == -1 ? 'Type' : null
        });
        this.send('ADD_GUI_RENDERABLE', {
          key: `manifest-panel-list-line-${row}-distance`,
          width: 40,
          height: rowHeight,
          xPosition: viewport.width - 80,
          yPosition: (this.initialY- 300) + listTopMargin + (row * rowHeight) + rowBottomMargin,
          textOffsetX: 6,
          textOffsetY: 4,
          fillStyle: 'rgba(0,0,0,0)',
          strokeStyle: 'rgba(0,0,0,0)',
          text: row == -1 ? 'Distance' : null
        });
      }
    }

    _shouldFilterOut(type) {
      if (type == this.currentFilter) {
        return false;
      }
      else if (this.currentFilter == 'poi' && ['planet', 'moon'].includes(type)) {
        return false;
      }
      else if (this.currentFilter == 'ship' && type.startsWith('ship_')) {
        return false;
      }
      else if (this.currentFilter == 'threats' && ['enemy_projectile', 'ship_enemy'].includes(type)) {
        return false;
      }
      return true;
    }

    _sortManifestList(manifestList) {
      return manifestList.sort((a, b) => { return a.distanceTo - b.distanceTo})
    }
    
    _updateManifestList(manifestList) {
      for(let row = 0; row < 10; row++) {
        let item = manifestList[row]
        if (item) {
          this.send('GUI_UPDATE_PROPERTIES', {
            key: `manifest-panel-list-line-${row}-type`,
            value: {
              text: item.typeLabel,
              fontColor: item.renderColor
            }
          });
          this.send('GUI_UPDATE_TEXT', {
            key: `manifest-panel-list-line-${row}-bearing`,
            value: `${item.bearingTo.toFixed(0) == 360 ? 360 : item.bearingTo.toFixed(0)}°`
          });
          this.send('GUI_UPDATE_TEXT', {
            key: `manifest-panel-list-line-${row}-distance`,
            value: `${toFriendlyMeters(toMetersFromCoordinateUnits(item.distanceTo))}`
          });
          this.send('GUI_UPDATE_TEXT', {
            key: `manifest-panel-list-line-${row}-label`,
            value: `${item.label}`
          });
        }
        else {
          this.send('GUI_UPDATE_TEXT', {
            key: `manifest-panel-list-line-${row}-type`,
            value: ``
          });
          this.send('GUI_UPDATE_TEXT', {
            key: `manifest-panel-list-line-${row}-distance`,
            value: ``
          });
          this.send('GUI_UPDATE_TEXT', {
            key: `manifest-panel-list-line-${row}-bearing`,
            value: ``
          });
          this.send('GUI_UPDATE_TEXT', {
            key: `manifest-panel-list-line-${row}-label`,
            value: ``
          });
          //
        }
      }
    }

    identifyAndSendEntityId(key) {
      let row = key.split('manifest-panel-list-line-')[1].split('-');
      if (row[1]) {
        return; // This is not the row event (it has a trailing suffix)
      }

      let rowDetails = this.manifestList[row[0]]

      if (!rowDetails) {
        return null;
      }

      this.currentSelectedRow = parseInt(row[0]);

      this.send('TRACK_ENTITY_REQUESTED', {entityId: rowDetails.entityId })

      let player = this._core.getKeyedAs('PLAYER')
      this.send('TARGET_REQUESTED', {sourceEntityId: player.getId(), targetEntityId: rowDetails.entityId})

      return rowDetails;
    }

    selectRow(viewportType, behavior) {
      if (this.manifestList.length) {
        let increment = 0;
        if (behavior == 'next') {
          increment = 1;
        }
        else if (behavior == 'previous') {
          increment = -1;
        }
        let nextRow = (this.currentSelectedRow || 0) + increment;
        if (nextRow < 0) {
          nextRow = this.manifestList.length - 1;
        }
        let nextIndex = nextRow % this.manifestList.length

        let rowDetails = null;
        rowDetails = this.identifyAndSendEntityId(`manifest-panel-list-line-${nextIndex}`); // Start at zero if 

        if (rowDetails && viewportType == 'primary') {
          this.send("INPUT_RECEIVED", { type: 'action', action: 'follow', entityId: rowDetails.entityId});
        }
      }
    }
  }
  
  