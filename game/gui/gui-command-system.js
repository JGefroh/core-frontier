import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'

import { angleTo, toFriendlyMeters, distanceFromTo, toMetersFromCoordinateUnits, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';
import OrbitComponent from '@game/orbiter/orbit-component.js';

export default class GuiCommandSystem extends System {
    constructor() {
      super()
      this.wait = 200
      this.selectedEntityId = null;
      this.lastSelectedEntityId = null;
      this.commandShortcuts = {
        'teleport': { label: 'DEBUG - Teleport to', description: 'Engage warp drive to this target.', action: 'teleport'},
        'move': { label: 'DEBUG - Move to current', description: 'Move to the current position', action: 'move'},
        'match_bearing': { label: 'DEBUG - Bear towards', description: 'Match the ship\'s bearing.', action: 'bear_towards'},
        'orbit': { label: 'DEBUG - Orbit', description: 'Orbit the object', action: 'orbit'},
        'target': { label: 'Target', description: 'Orbit the object', action: 'target'},
        'move_to': { label: 'DEBUG - Move to', description: 'Orbit the object', action: 'move_to'},
        'warp_to': { label: 'Warp to', description: 'Orbit the object', action: 'warp_to'},
      }
      this.commands = [];

      setTimeout(() => {
        // this._addPanel()
      }, 100)

      this.addHandler('TRACK_ENTITY_REQUESTED', (payload) => {
        this.selectedEntityId = payload.entityId
      })

      this.addHandler('UI_CLICKED', (payload) => {
        if (payload.key.indexOf('command-panel-list-line') !== -1) {
          let command = this.commands[parseInt(payload.key.split('command-panel-list-line-')[1])]
          this.onCommand(command)
        }
      })
    }

    work() {
        if (!this.selectedEntityId) {
            return;
        }

        let entity = this._core.getEntityWithId(this.selectedEntityId);
        if (!entity) {
          return;
        }
        let commandable = this.getTag('Commandable')
        commandable.setEntity(entity)
        let commandList = this.getSupportedCommandsWithDefaults(commandable)
        this._updateCommandList(commandList)
        this.commands = commandList;
    };

    _addPanel() {
      let viewport = this._core.getData('VIEWPORT');
      let yPosition = 230;

      let rowBottomMargin = 5;
      let listTopMargin = -5;
      let rowHeight = 20;

      this.send('ADD_GUI_RENDERABLE', {
        key: 'command-panel',
        width: 320,
        height: 140,
        xPosition: viewport.width - 324,
        yPosition: 230,
        textOffsetY: 8,
        textOffsetX: 8,
        fontSize: 14
      });

      for(let row = -1; row < 7; row++) {
        if (row != -1) {
          this.send('ADD_GUI_RENDERABLE', {
            key: `command-panel-list-line-${row}`,
            width: 320,
            height: rowHeight,
            xPosition: viewport.width - 324,
            yPosition: (yPosition) + listTopMargin + (row * rowHeight) + rowBottomMargin,
            textOffsetX: 6,
            textOffsetY: 4,
            hoverStyles: {
              fillStyle: 'green'
            }
          });
        }
      }
    }

    getSupportedCommandsWithDefaults(commandable) {
      let supportedCommands = [];

      this.addDefaultCommands(supportedCommands);

      (commandable.getSupportedCommands() || []).forEach((command) => {
        if (typeof command == 'string') {
          if (this.commandShortcuts[command]) {
            supportedCommands.push(this.commandShortcuts[command])
          }
        }
        else {
          supportedCommands.push(command)
        }
      })

      return supportedCommands;
    }

    addDefaultCommands(commandList) {
      commandList.push(this.commandShortcuts['move_to'])
      // commandList.push(this.commandShortcuts['warp_to'])

      commandList.push(this.commandShortcuts['teleport'])
      // commandList.push(this.commandShortcuts['move'])
      // commandList.push(this.commandShortcuts['match_bearing'])
      // commandList.push(this.commandShortcuts['orbit'])
      // commandList.push(this.commandShortcuts['target'])
    }

    _updateCommandList(commandList) {
      for(let row = -1; row < 10; row++) {
        if (row != -1) {
          this.send('GUI_UPDATE_TEXT', {
            key: `command-panel-list-line-${row}`,
            value: commandList[row]?.label || ''
          });
        }
      }
    }
    
    onCommand(command) {
      if (!command) {
        return;
      }
      
      let player = this._core.getKeyedAs('PLAYER')
      let target = this._core.getEntityWithId(this.selectedEntityId)
      player.removeComponent('OrbitComponent')

      if (command.action == 'warp_to') {
        let position = target.getComponent('PositionComponent')

        if (!target) {
          return;
        }
        this.send('COMMAND_WARP_TO', {commandedEntityId: player.getId(), xPosition: position.xPosition, yPosition: position.yPosition})
        
      }
      else if (command.action == 'teleport') {
        let position = target.getComponent('PositionComponent')

        if (!target) {
          return;
        }

        player.getComponent('PositionComponent').xPosition = position.xPosition
        player.getComponent('PositionComponent').yPosition = position.yPosition
      }
      else if (command.action == 'move') {
        let position = player.getComponent('PositionComponent')

        if (!target) {
          return;
        }
        
        target.getComponent('PositionComponent').xPosition = position.xPosition
        target.getComponent('PositionComponent').yPosition = position.yPosition
      }
      else if (command.action == 'bear_towards') {
        let playerPosition = player.getComponent('PositionComponent')
        playerPosition.bearingDegrees = angleTo(playerPosition.xPosition, playerPosition.yPosition, target.getComponent('PositionComponent').xPosition, target.getComponent('PositionComponent').yPosition)
      }
      else if (command.action == 'orbit') {
        player.removeComponent('OrbitComponent')
        player.addComponent(new OrbitComponent({orbitRadius: toCoordinateUnitsFromMeters(100), orbitCompletionTime: 60, orbitEntityId: this.selectedEntityId}));
      }
      else if (command.action == 'target') {
        this.send('TARGET_REQUESTED', {sourceEntityId: player.getId(), targetEntityId: target.getId()})
        this.send('SET_IFF', {entityId: target.getId(), iff: 'enemy'})
      }
      else if (command.action == 'iff_enemy') {
        this.send('SET_IFF', {entityId: target.getId(), iff: 'enemy'})
      }
      else if (command.action == 'iff_neutral') {
        this.send('SET_IFF', {entityId: target.getId(), iff: 'neutral'})
      }
      else if (command.action == 'move_to') {
        let position = target.getComponent('PositionComponent')
        this.send('COMMAND_MOVE_TO', {commandedEntityId: player.getId(), xPosition: position.xPosition, yPosition: position.yPosition})
      }
    }
  }
  
  