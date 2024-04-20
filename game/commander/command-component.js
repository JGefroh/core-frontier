import { default as Component} from '@core/component'

export default class CommandComponent extends Component {
    constructor(payload = {}) {
        super();
        this.activeCommands = {}
        
        this.componentType = "CommandComponent"
        this.supportedCommands = payload.supportedCommands || [] // Used by GuiCommandSystems

        this.commandSequences = [
        ]
    }
}


// Command - Move to [from still]:
   // Turn towards target
   // Accelerate to maximum
   // Maintain bearing towads target
   // At 1/2 way-point
      // 180 degree turn
      // Decelerate to maximum
      // maintain opposite bearing towards target
      // Once speed hits zero, stop.


// Command - Come to stop
  // 180-degree turn
  // Accelerate
     // Cut engines


