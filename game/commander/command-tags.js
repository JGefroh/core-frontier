import { default as Tag } from '@core/tag'

export default class Commandable extends Tag {
    static tagType = 'Commandable'

    constructor() {
        super()
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('CommandComponent');
    };

    getActiveCommand() {
      let commandSequence = this.entity.getComponent('CommandComponent')?.commandSequences[0]
      if (commandSequence) {
        return commandSequence[0]
      }
    }

    nextCommandStep() {
      let commandSequences = this.entity.getComponent('CommandComponent')?.commandSequences
      if (!commandSequences.length) {
        return;
      }

      let commandSequence = commandSequences[0]
      if (commandSequence[0]) {
        return commandSequence.shift()
      }
    }

    getSupportedCommands() {
      return this.entity.getComponent('CommandComponent')?.supportedCommands || [];
    }

    addCommandSequence(commandSequence) {
      this.entity.getComponent('CommandComponent')?.commandSequences.push(commandSequence)
    }
  }
  