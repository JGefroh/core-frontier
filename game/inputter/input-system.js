import { default as System } from '@core/system';

export default class InputSystem extends System {
    constructor() {
        super();
        let self = this;
        this.keyMap = {
            // Display controls
            'ArrowRight_hold': 'move_viewport_right',
            'ArrowRight_press': 'move_viewport_right',
            'ArrowLeft_hold': 'move_viewport_left',
            'ArrowLeft_press': 'move_viewport_left',
            'ArrowUp_hold': 'move_viewport_up',
            'ArrowUp_press': 'move_viewport_up',
            'ArrowDown_hold': 'move_viewport_down',
            'ArrowDown_press': 'move_viewport_down',
            '=_press': 'main_viewport_zoom_in',
            '-_press': 'main_viewport_zoom_out',
            '=_hold': 'main_viewport_zoom_in',
            '-_hold': 'main_viewport_zoom_out',
            '\\_release': 'render_layer',


            // Target controls
            'Tab_release': 'next_secondary', 
            'Tab_release_shift': 'previous_secondary',
            'v_release': 'view_primary',
            't_release': 'focus',

            //Engine controls
            'a_hold': 'turn_left',
            'a_press': 'turn_left',
            'd_hold': 'turn_right',
            'd_press': 'turn_right',
            'w_press': 'thrust_forward',
            'w_hold': 'thrust_forward',
            's_press': 'thrust_backward',
            's_hold': 'thrust_backward',
            'q_press': 'thrust_left',
            'q_hold': 'thrust_left',
            'e_press': 'thrust_right',
            'e_hold': 'thrust_right',
            'z_press': 'thrust_stop',

            //Weapons controls
            ' _hold': 'fire_pdc',
            ' _press': 'fire_pdc',
            '1_press': 'weapon_group_1',
            '2_press': 'weapon_group_2',
            '3_press': 'weapon_group_3',
            '4_press': 'weapon_group_4',
            '5_press': 'weapon_group_5',
            '6_press': 'weapon_group_6',
            '7_press': 'weapon_group_7',
            '8_press': 'weapon_group_8',
            '9_press': 'weapon_group_9',
            '1_hold': 'weapon_group_1',
            '2_hold': 'weapon_group_2',
            '3_hold': 'weapon_group_3',
            '4_hold': 'weapon_group_4',
            '5_hold': 'weapon_group_5',
            '6_hold': 'weapon_group_6',
            '7_hold': 'weapon_group_7',
            '8_hold': 'weapon_group_8',
            '9_hold': 'weapon_group_9',
            '1_release': 'weapon_group_1_stop',
            '2_release': 'weapon_group_2_stop',
            '3_release': 'weapon_group_3_stop',
            '4_release': 'weapon_group_4_stop',
            '5_release': 'weapon_group_5_stop',
            '6_release': 'weapon_group_6_stop',
            '7_release': 'weapon_group_7_stop',
            '8_release': 'weapon_group_8_stop',
            '9_release': 'weapon_group_9_stop',

            //
            'i_release': 'toggle_inventory',
        };

        this.activeKeys = {};

        this.activeActions = {
        }

        this.isZooming = false;
        this.initialDistance = 0;

        let fireAppropriateEvent = (event, eventType) => {
            if (event.type.indexOf('keydown') !== -1) {
                this.activeKeys[event.key] = event.repeat ? 'hold' : 'press';
            }
            else if (event.type.indexOf('keyup') !== -1) {
                this.activeKeys[event.key] = 'release';
            }
            else if(event.type.indexOf('dblclick') !== -1) {
                self.send("INPUT_RECEIVED", { type: 'double_click',  ...this._getCursorCoordinates(event)})
            }
            else if(event.type.indexOf('click') !== -1) {
                self.send("INPUT_RECEIVED", { type: 'click', ...this._getCursorCoordinates(event)});
                self._core.publishData('CURSOR_COORDINATES', this._getCursorCoordinates(event));
                this.send("DEBUG_DATA", {type: 'cursor', ...this._getCursorCoordinates(event)})

            }
            else if(event.type.indexOf('mouse') !== -1) {
                let cursorCoordinates =  this._getCursorCoordinates(event);
                self.send("INPUT_RECEIVED", { type: 'cursor_position', ...this._getCursorCoordinates(event)});
                self._core.publishData('CURSOR_COORDINATES', this._getCursorCoordinates(event));
                this.send("DEBUG_DATA", {type: 'cursor', ...this._getCursorCoordinates(event)})

                let playerEntity = this._core.getKeyedAs('PLAYER')
                if (window.location.href.indexOf('debugmovewithmouse') != -1 && playerEntity && cursorCoordinates) {
                    playerEntity.getComponent('PositionComponent').xPosition = cursorCoordinates.world.xPosition;
                    playerEntity.getComponent('PositionComponent').yPosition = cursorCoordinates.world.yPosition;
                }
            }
            else if (event.type.indexOf('scroll') !== -1) {
                self.send("INPUT_RECEIVED", { type: 'scroll'})
            }
            else if (event.type.indexOf('contextmenu') !== -1) {
                self.send("INPUT_RECEIVED", { type: 'contextmenu', ...this._getCursorCoordinates(event)});
            }
        }

        window.onkeydown = function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event);
        
        };
        
        window.onkeyup = function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event);
        };

        window.onclick = function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event);
        }

        window.onmousemove = function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event);
        }

        window.ondblclick = function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event);
        }

        window.addEventListener('contextmenu', function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event)
        });

        window.addEventListener('wheel', function(event) {
            // Your custom scroll event handling code here
            event.stopPropagation();
            event.preventDefault();
        });
    }

    work() {
        if (this.notYetTime(100, this.lastRanTimestamp)) {
            return;
        }
        let shiftModifier = this.activeKeys['Shift']

        Object.keys(this.activeKeys).forEach((key) => {
            this.send("INPUT_RECEIVED", { type: 'action', action: this.keyMap[`${key}_${this.activeKeys[key]}${shiftModifier ? '_shift' : ''}`]});
            if (this.activeKeys[key] == 'release') {
                delete this.activeKeys[key]
            }
        });
        this.lastRanTimestamp = new Date();

        this.send("DEBUG_DATA", {type: 'key', key: Object.keys(this.activeKeys).join('')})
    }

    _getCursorCoordinates(event) {
        let viewport = this._core.getData('VIEWPORT');
        if (!viewport) {
            viewport = {xPosition: 0, yPosition: 0}
        }
        return {
            canvas: {xPosition: event.offsetX, yPosition: event.offsetY},
            world: {xPosition: ((event.offsetX) + (viewport.xPosition)) / viewport.scale, 
                    yPosition: ((event.offsetY) + (viewport.yPosition)) / viewport.scale } 
        }
    }

  }