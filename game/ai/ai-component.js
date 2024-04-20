import { default as Component} from '@core/component'

export default class AiComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = "AiComponent"
        this.currentState = {}
        this.goal = null;
        this.tactic = null;
        this.action = null;

        this.actions = {
        }
    }

    setActionLastRan(actionKey) {
        this.actions[actionKey] = Date.now();
    }

    getActionLastRan(actionKey) {
        return this.actions[actionKey];
    }
}