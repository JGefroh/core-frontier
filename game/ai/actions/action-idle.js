import { ActionBase } from '@game/ai/actions/action-base';

export class ActionIdle extends ActionBase {
    constructor(configuration) {
        super(configuration)
        this.score = 0;
        this.key = 'action_idle'
        this.stepOptions = [
        ]
    }

    prepareAction(currentState) {
    }

    calculateScore(currentState) {
        this.score = 1
    }
}