import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'
import { calculateDimensions } from '@game/utilities/canvas-util.js'

export default class GuiViewportControlsSystem extends System {
    constructor() {
      super()
      this._addUiHandlers();
      this._addNavigationPanel();
    }

    work() {
    };
    

    _addUiHandlers() {
      this.addHandler('DEBUG_DATA', (payload) => {
          if (payload.type == 'cursor') {
            this.send("GUI_UPDATE_TEXT", { key: 'navigation-panel-coordinates-cursor', value: `x${(payload.canvas.xPosition || 0).toFixed(0)}, y${(payload.canvas.yPosition || 0).toFixed(0)}` + ` | x${(payload.world.xPosition || 0).toFixed(0)}, y${(payload.world.yPosition || 0).toFixed(0)}`})
          }

          if (payload.type == 'viewport') {
            this.send("GUI_UPDATE_TEXT", { key: 'navigation-panel-coordinates-viewport', value: `x${payload.xPosition.toFixed(0)}, y${payload.yPosition.toFixed(0)} | ${payload.width}x${payload.height} | ${payload.scale}x`})
          }
        }
      );

      this.addHandler('UI_CLICKED', (payload) => {
        if (payload.key == 'navigation-panel-button-tac-map') {
            this.send("INPUT_RECEIVED", { type: 'action', action: 'render_layer'});
        }
        if (payload.key == 'navigation-panel-button-zoom-in') {
            this.send("INPUT_RECEIVED", { type: 'action', action: 'main_viewport_zoom_in'});
        }
        if (payload.key == 'navigation-panel-button-zoom-out') {
            this.send("INPUT_RECEIVED", { type: 'action', action: 'main_viewport_zoom_out'});
        }
        if (payload.key == 'navigation-panel-button-zoom-reset') {
            this.send("INPUT_RECEIVED", { type: 'action', action: 'main_viewport_zoom_reset'});
        }
        if (payload.key == 'navigation-panel-button-help') {
            alert('Instructions: \n\nTurn | A D\nAccelerate/Decelerate | W S\nStrafe | Q E\nFire weapon group | 1 2 3 4 5 6 7 8 9\nZoom in | +\nZoom out | -\nToggle tactical display | \\\nSelect an entity | Mouse click\nAim | Use the mouse');
        }
      })
    }
    
    _addNavigationPanel() {
        setTimeout(() => {
            let viewport = this._core.getData('VIEWPORT') || {x: 0, y: 0, width: 1024, height: 768};

            this.send('ADD_GUI_RENDERABLE', {
                key: 'navigation-panel',
                width: viewport.width - 700,
                height: 30,
                xPosition: 335,
                yPosition: 18,
                fillStyle: '#031424',
                strokeStyle: this.panelBorderColor
            });
            this.send('ADD_GUI_RENDERABLE', {
                key: `navigation-panel-label`,
                xPosition: 346,
                yPosition: 27,
                width: 100,
                height: 30,
                text: 'NAVIGATION',
                fillStyle: 'rgba(0,0,0,0)',
                strokeStyle: 'rgba(0,0,0,0'
            });
        
            this.send('ADD_GUI_RENDERABLE', {
                key: `navigation-panel-button-tac-map`,
                xPosition: viewport.width - 470,
                yPosition: 26,
                width: 70,
                height: 14,
                textOffsetX: 5,
                text: 'TAC/MAP',
            })
            this.send('ADD_GUI_RENDERABLE', {
                key: `navigation-panel-button-zoom-in`,
                xPosition: viewport.width - 550,
                yPosition: 26,
                width: 14,
                height: 14,
                textOffsetX: 3,
                text: '+',
            })
            this.send('ADD_GUI_RENDERABLE', {
                key: `navigation-panel-button-zoom-out`,
                xPosition: viewport.width - 530,
                yPosition: 26,
                width: 14,
                height: 14,
                textOffsetX: 5,
                text: '-',
            })
            this.send('ADD_GUI_RENDERABLE', {
                key: `navigation-panel-button-zoom-reset`,
                xPosition: viewport.width - 510,
                yPosition: 26,
                width: 14,
                height: 14,
                textOffsetX: 3,
                text: 'x',
            })
            this.send('ADD_GUI_RENDERABLE', {
                key: `navigation-panel-button-help`,
                xPosition: viewport.width - 720,
                yPosition: 26,
                width: 40,
                height: 14,
                textOffsetX: 6,
                text: 'Help',
            })
            
            this.send('ADD_GUI_RENDERABLE', {
                key: `navigation-panel-coordinates-viewport`,
                xPosition: 450,
                yPosition: 34,
                text: 'v####x####',
                fontSize: 10
            });
    
            this.send('ADD_GUI_RENDERABLE', {
                key: `navigation-panel-coordinates-cursor`,
                xPosition: 450,
                yPosition: 22,
                text: 'm####x####',
                fontSize: 10
            });
        }, 100)
        
    }
  }
  
  