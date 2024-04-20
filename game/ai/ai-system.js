import { default as System } from '@core/system';

import { distanceFromTo, angleTo, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';

import AiComponent from '@game/ai/ai-component';

import { GoalAttack } from '@game/ai/goals/goal-attack';
import { GoalDefend } from '@game/ai/goals/goal-defend';
import { GoalShootMissiles } from '@game/ai/goals/goal-shoot-missiles';

import { ActionAccelerateTo } from '@game/ai/actions/action-accelerate-to';
import { ActionMoveTo } from '@game/ai/actions/action-move-to';
import { ActionIdle } from '@game/ai/actions/action-idle';
import { ActionAttack } from '@game/ai/actions/action-attack';
import { ActionSelectNearbyTarget } from '@game/ai/actions/action-select-nearby-target';
import { ActionFireWeapon } from '@game/ai/actions/action-fire-weapon';
import { ActionFireWeaponAtTarget } from '@game/ai/actions/action-fire-weapon-at-target';


import { StepCalculateRandomAcceleration } from '@game/ai/steps/step-calculate-random-acceleration';
import { StepCalculateDestination } from '@game/ai/steps/step-calculate-destination';
import { StepCalculateDecelerationBearing } from './steps/step-calculate-deceleration-bearing';
import { StepSetBearing } from '@game/ai/steps/step-set-bearing';
import { StepSetAcceleration } from '@game/ai/steps/step-set-acceleration';
import { StepSetMagnitude } from '@game/ai/steps/step-set-magnitude';
import { StepFireWeaponAtTarget } from '@game/ai/steps/step-fire-weapon-at-target';


import { TacticPatrol } from '@game/ai/tactics/tactic-patrol'; 
import { TacticAttack } from '@game/ai/tactics/tactic-attack'; 
import { TacticTurret } from '@game/ai/tactics/tactic-turret';
import { WaitTilTurnPoint } from './steps/step-wait-til-turn-point';
import { StepSelectNearestTarget } from './steps/step-select-nearest-target';
import { StepMoveAdjustToDestination } from './steps/step-move-adjust-to-destination';


export default class AiSystem extends System {
    constructor() {
      super();

      this.goals = {
      }

      this.tactics = {
        'patrol': TacticPatrol,
        'attack': TacticAttack,
        'turret': TacticTurret,
      }

      this.actions = {
        'move_to': ActionMoveTo,
        'accelerate_to': ActionAccelerateTo,
        'idle': ActionIdle,
        'attack': ActionAttack,
        'select_nearby_target': ActionSelectNearbyTarget,
        'fire_weapon': ActionFireWeapon,
        'fire_weapon_at_target': ActionFireWeaponAtTarget
      }

      this.steps = {
        'calculate_random_acceleration': StepCalculateRandomAcceleration,
        'calculate_deceleration_bearing': StepCalculateDecelerationBearing,
        'calculate_destination': StepCalculateDestination,
        'set_bearing': StepSetBearing,
        'set_acceleration': StepSetAcceleration,
        'set_magnitude': StepSetMagnitude,
        'wait_til_turn_point': WaitTilTurnPoint,
        'select_nearest_target': StepSelectNearestTarget,
        'fire_weapon_at_target': StepFireWeaponAtTarget,
        'move_adjust_to_destination': StepMoveAdjustToDestination
      }

      this.addHandler('SET_AI', (payload) => {
        let entity = this._core.getEntityWithId(payload.entityId)
      })
    }
    
    work() {
      this.workForTag('Ai', (tag, entity) => {
        let currentState = tag.getCurrentState();
        currentState.entityId = entity.id
        this.informCurrentState(currentState, tag, entity);

        let goal = this.identifyGoal(tag, entity);
        tag.setGoal(goal);
        let tactic = this.identifyTactic(goal);
        tag.setTactic(tactic);
        let action = this.identifyAction(tactic, currentState, tag)
        tag.setAction(action)
        
        if (!action) {
          return;
        }

        let steps = this.getStepsToExecute(action, currentState, tag);
        if (steps?.length) {
          this.executeSteps(steps, currentState);
        }

        tag.setCurrentState(currentState)
        if (window.location.href.indexOf('aidebug') != -1) {
          if (entity.getComponent('DetailComponent')) {
            // entity.getComponent('DetailComponent').debugLine2 = currentState.desiredBearing
            // entity.getComponent('DetailComponent').debugLine1 = currentState.desiredBearingB
            entity.getComponent('DetailComponent').debugLine1 = action.constructor.name
            entity.getComponent('DetailComponent').debugLine2 = (steps || []).map((step) => { return step?.constructor?.name})?.join(',')
          }
        }
      });
    };

    informCurrentState(currentState, tag, entity) {
      currentState.bearingDegrees = entity.getComponent('PositionComponent').bearingDegrees
      currentState.xPosition = entity.getComponent('PositionComponent').xPosition
      currentState.yPosition = entity.getComponent('PositionComponent').yPosition
      currentState.accelerationMagnitude = entity.getComponent('VectorComponent')?.accelerationMagnitude
      currentState.accelerationMagnitudeMax = entity.getComponent('VectorComponent')?.accelerationMagnitudeMax || 300
      let vector = entity.getComponent('VectorComponent')?.calculateTotalVector()
      currentState.vectorMagnitude = vector?.magnitude;
      currentState.vectorBearing = vector?.angleDegrees;
      currentState.vectorXDelta = vector?.xDelta;
      currentState.vectorYDelta = vector?.yDelta;
    }

    identifyGoal(tag, entity) {
      let relationship = entity.getComponent('RelationshipComponent');
      if (!relationship) {
      }
      else {
        if (entity.getComponent('WeaponComponent')?.weaponKey == 'pdc') {
          return new GoalShootMissiles();
        }
        else if (relationship.nation == 'unn' && relationship.faction == 'military') {
          return new GoalDefend({xPosition: 0, yPosition: 0, radius: 3000});
        }
        else if (relationship.nation == 'plutarch' && relationship.faction == 'military') {
          return new GoalAttack({xPosition: 0, yPosition: 0, radius: 1000});
        }
      }
      return new GoalDefend();
    }

    identifyTactic(goal) {
      let tacticOptions = goal.getTacticOptions();
      // let selection =  Math.round(Math.random());
      // const currentTime = Date.now();

      // // Calculate the block number (assuming each block is 10 seconds)
      // const blockNumber = Math.floor(currentTime / 10000);
  
      // // Return 0 for even block numbers, 1 for odd block numbers
      // selection = blockNumber % 2;
      let selection = 0
      return new this.tactics[tacticOptions[selection].key](tacticOptions[selection].configuration)
    }

    identifyAction(tactic, currentState, tag) {
      let actionOptions = tactic.getActionOptions();
      let actionObjects = []
      actionOptions.forEach((actionOption) => {
        actionObjects.push(new (this.actions[actionOption.key])(actionOption.configuration))
      })

      let highestActions = [];
      actionObjects.forEach((actionObject) => {
        let action = actionObject;
        let key = actionObject.key;
        action.calculate(currentState, tag.getActionLastRan(key), this._core);

        if (!action.getScore()) {
          return;
        }
        if (!highestActions.length) {
          highestActions.push(action);
        }
        else if (highestActions[0].getScore() == action.getScore()) {
          highestActions.push(action)
        }
        else if (highestActions[0].getScore() < action.getScore()) {
          highestActions = [action]
        }
      });

      if (tag.getAction() && !tag.getAction().isCompleted()) {
        let highestAction = highestActions[0]
        if (highestAction.key == tag.getAction().key) {
          return tag.getAction()
        }
      }

      return highestActions[0];
    }

    getStepsToExecute(action, currentState, tag) {
      let stepOptions = []
      let stepObjects = null;
      

      if (action.getCurrentStepIndex() == null) {
        action.prepareAction(currentState, this._core)
        let stepOptions = action.getStepOptions();
        let stepObjects = stepOptions.map((stepOption) => { return new this.steps[stepOption.key](this._core, currentState, stepOption.configuration) });
        action.setSteps(stepObjects);
        action.setCurrentStepIndex(0)
      }

      stepObjects = action.getSteps()

      let stepsToRun = []
      stepObjects.forEach((stepObject, index) => {
        if (stepObject.alwaysRun()) {
          stepsToRun.push(stepObject);
        }
        else if (stepObject.alwaysRunUntilComplete() && !stepObject.isCompleted()) {
          stepsToRun.push(stepObject);
        }
        else if (index == action.getCurrentStepIndex()) {
          if (stepObject.isCompleted()) {
            action.setCurrentStepIndex(action.getCurrentStepIndex() + 1);
          }
          else {
            stepsToRun.push(stepObject);
          }
        }
      });

      if (!stepObjects.length || stepObjects.every((stepObject) => { return stepObject.isCompleted() })) {
        action.markCompleted(currentState)
        tag.setActionLastRan(action.key)
        return null;
      }

      action.beforeActionRun(currentState, this._core)

      return stepsToRun
    }

    executeSteps(stepsToExecute, currentState) {
      let payload = {}
      stepsToExecute.forEach((stepToExecute) => {
        if (stepToExecute.isNotStarted()) {
          stepToExecute.setState('in_progress');
          stepToExecute.executeStep(currentState);
        } else if (stepToExecute.isInProgress() && stepToExecute.checkCompleted(currentState)) {
            stepToExecute.setState('completed');
            if (stepToExecute.alwaysRun()) {
              stepToExecute.executeStep(currentState);
            }
        } else if (stepToExecute.isInProgress()) {
            stepToExecute.executeStep(currentState);
        }
      });
    }

    deleteKeysNotInObject(obj1, obj2) {
      for (let key in obj1) {
          if (!obj2.hasOwnProperty(key)) {
              delete obj1[key];
          }
      }
    }
  }
  