import { default as Component} from '@core/component'

export default class WeaponComponent extends Component {
    constructor(payload) {
        super();
        this.componentType = "WeaponComponent"
        this.lastFired = null;
        this.currentAmmunition = payload.currentAmmunition || 0;
        this.fireRequested = false;
        this.weaponKey = payload.weaponKey || null;
        this.weaponGroup = payload.weaponGroup || 1;

        // If using inventory system
        this.loadedAmmoItemId = payload.loadedAmmoItemId;
    }
}