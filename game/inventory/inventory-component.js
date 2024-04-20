import { default as Component} from '@core/component'
import InventoryItem from '@game/inventory/inventory-item'

export default class InventoryComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = "InventoryComponent"
        this.items = [];
    }

    adjustItem(id, count) {
        let itemInfo = null;
        this.items.forEach((item) => {
            if (item.id == id) {
                itemInfo = item;
            }
        });
        if (itemInfo) {
            itemInfo.count += count;
        }
        else {
            this.items.push({id: id, count: count});
        }
    }

    getCount(itemId) {
        let itemCount = 0;
        this.items.forEach((item) => {
            if (item.id == itemId) {
                itemCount = item.count
            }
        });
        return itemCount;
    }
}