import { default as Tag } from '@core/tag'

export default class Ai extends Tag {
  static tagType = 'Ai'

  constructor() {
      super()
  }

  static isAssignableTo(entity) {
    return entity.hasComponent('AiComponent');
  };

  getCurrentState() {
    return this.entity.getComponent('AiComponent').currentState;
  }

  setCurrentState(currentState) {
    this.entity.getComponent('AiComponent').currentState = currentState;
  }

  setGoal(goal) {
    this.entity.getComponent('AiComponent').goal = goal;
  }

  getGoal() {
    return this.entity.getComponent('AiComponent').goal;
  }

  setTactic(tactic) {
    this.entity.getComponent('AiComponent').tactic = tactic;
  }

  getTactic() {
    return this.entity.getComponent('AiComponent').tactic;
  }

  setAction(action) {
    this.entity.getComponent('AiComponent').action = action;
  }

  getAction() {
    return this.entity.getComponent('AiComponent').action;
  }

  setSteps(steps) {
    this.entity.getComponent('AiComponent').steps = steps;
  }

  getSteps() {
    return this.entity.getComponent('AiComponent').steps;
  }

  setActionLastRan(key) {
    return this.entity.getComponent('AiComponent').setActionLastRan(key)
  }
  getActionLastRan(key) {
    return this.entity.getComponent('AiComponent').getActionLastRan(key)
  }
}
  