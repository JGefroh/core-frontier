import { default as Component } from '@core/component';

export default class RelationshipComponent extends Component {
    constructor(payload) {
        super()
        this.componentType = 'RelationshipComponent'

        // Classification can be:
           // Enemy
           // Ally
           // Neutral
        this.classificationByEntityId = {} 
        
        this.nation = payload.nation || 'default'; // UN, Flagless
        this.faction = payload.faction || 'default'; // Civilian, Military

        if (this.nation == 'unn') {
            this.classificationByNation = {
                'unn': 'ally',
                'player': 'friendly',
                'plutarch': 'enemy',
                'default': 'neutral'
            } 
        }
        else if (this.nation == 'plutarch') {
            this.classificationByNation = {
                'unn': 'enemy',
                'player': 'enemy',
                'plutarch': 'ally',
                'default': 'neutral'
            } 
        }
        else {
            this.classificationByNation = {
                'unn': 'neutral',
                'player': 'neutral',
                'plutarch': 'neutral',
                'default': 'neutral'
            } 
        }
    }

    getClassificationForNation(nation) {
        return this.classificationByNation[nation] || 'unknown'
    }
}