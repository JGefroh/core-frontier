import { default as Component } from '@core/component';

export default class TargetComponent extends Component {
    constructor(payload = {}) {
        super()
        this.componentType = 'TargetComponent'
        this.targetEntityIds = [];
    }

    setTargetEntityId(targetEntityId) {
        this.targetEntityIds = [targetEntityId]
    }

    addTargetEntityId(targetEntityId) {
        this.targetEntityIds.push(targetEntityId)
    }
}