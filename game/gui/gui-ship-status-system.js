import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'

export default class GuiSystem extends System {
    constructor() {
      super()
      this._addStatusHandlers();
      this._addShipStatusPanel();

      this.panelX = 4;
      this.panelY = 420;

    }

    _addStatusHandlers() {
      this.addHandler('DEBUG_DATA', (payload) => {
          let guiText = this.getTag('GuiText');
          if (!guiText) {
            return;
          }

          if (payload.type == 'timing') {
            this.send("GUI_UPDATE_TEXT", {key: 'ship-panel-latency-value', value: `${payload.workTime.toFixed(1)}ms`})
            this.send("GUI_UPDATE_TEXT", {key: 'ship-panel-slowest-value', value: `${payload.slowestSystemTime.toFixed(2)}ms`})
            this.send("GUI_UPDATE_TEXT", {key: 'ship-panel-slowest-status', value: `OK`})
            this.send("GUI_UPDATE_TEXT", {key: 'ship-panel-slowest-name', value: payload.slowestSystem})
          }

          if (payload.type == 'cursor') {
            this.forKeyedAs('coordinates-cursor', (entity) => {
              guiText.setEntity(entity);
              guiText.setText(`x${(payload.canvas.xPosition || 0).toFixed(0)}, y${(payload.canvas.yPosition || 0).toFixed(0)}` + ` | x${(payload.world.xPosition || 0).toFixed(0)}, y${(payload.world.yPosition || 0).toFixed(0)}`);
            });
          }

          if (payload.type == 'viewport') {
            this.forKeyedAs('coordinates-viewport', (entity) => {
              guiText.setEntity(entity);
              guiText.setText(`x${payload.xPosition.toFixed(0)}, y${payload.yPosition.toFixed(0)} | ${payload.width}x${payload.height} | ${payload.scale}x`);
            });
          }
        }
      );
    }

    work() {
    };

    _addShipStatusPanel() {
      setTimeout(() => {
        let viewport = this._core.getData('VIEWPORT');
        let yPosition = 18
        this.send('ADD_GUI_RENDERABLE', {
          key: 'ship-panel',
          width: 320,
          height: 200,
          xPosition: this.panelX,
          yPosition: this.panelY,
          fillStyle: '#031424',
          strokeStyle: this.panelBorderColor,
          text: 'SHIP STATUS',
          textOffsetY: 12,
          textOffsetX: 12,
          fontSize: 16
        });

        this._addShipPanelLine(yPosition, 1, 'ship-panel', 'latency', 'Comm. Array', 'OK')
        this._addShipPanelLine(yPosition, 2, 'ship-panel', 'acceleration', 'Acceleration', 'OK')
        this._addShipPanelLine(yPosition, 3, 'ship-panel', 'speed', 'Engines', 'OK')
        this._addShipPanelLine(yPosition, 4, 'ship-panel', 'bearing', 'MCAS', 'OK')
        this._addShipPanelLine(yPosition, 5, 'ship-panel', 'slowest', '', '')
        this._addShipPanelLine(yPosition, 6, 'ship-panel', 'health', 'Hull Integrity', 'OK', 1000)
      }, 100)
    }

    _addShipPanelLine(yPosition, lineNumber, key, metric, label, state, value = null) {
      let viewport = this._core.getData('VIEWPORT');
      let size = 22;
      let line2 = new Entity({key: `${key}-${metric}-name`});
      let fontSize = 14
      let initialX = this.panelX;
      let initialY = this.panelY + 16;

      this.send('ADD_GUI_RENDERABLE', {
        key: `${key}-${metric}-name`,
        xPosition: initialX + fontSize,
        yPosition: initialY + lineNumber * size + lineNumber,
        text: label
      });
      this.send('ADD_GUI_RENDERABLE', {
        key: `${key}-${metric}-status`,
        xPosition: initialX + 160,
        yPosition: initialY + lineNumber * size + lineNumber,
        text: state,
      })
      this.send('ADD_GUI_RENDERABLE', {
        key: `${key}-${metric}-value`,
        xPosition: initialX + 260,
        yPosition: initialY + lineNumber * size + lineNumber,
        text: value
      })
    }
  }
  
  