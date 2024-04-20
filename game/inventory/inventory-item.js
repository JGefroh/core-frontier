export default class InventoryItem {

    constructor(payload) {
        this.id = payload.id;
        this.count = 0;
    }

    static allItemsById() {
        let objects = [
            {id: 1000, key: 'pdc_ammo', label: '40mm PDC round', category: 'Munition', subcategory: 'PDC', volumePerUnit: 0.15, unit: 'rounds', description: 'Standard 40mm round, using primarily by Point Defense Cannons for ballistic threat defense. \n\n Crafted from a blend of tungsten and other materials, each round meets exacting mil-spec standards defined by the UN - all at the lowest bid, of course.'} ,
            {id: 1001, key: 'railgun_ammo', label: 'Railgun slug', category: 'Munition', subcategory: 'Railgun', volumePerUnit: 0.15, unit: 'slugs', description: 'A standard 1kg railgun slug. \n\n Primarily utilized by electromagnetic railguns for kinetic, energy-based launchers. Crafted from a dense composite of tungsten and high-strength alloys,,these slugs deliver devastating kinetic force to their targets with precision and efficiency. \n\n It makes a nice paperweight, too.'},
            {id: 1002, key: 'missile_ammo', label: 'Osiris Missile', category: 'Munition', subcategory: 'Missile', volumePerUnit: 0.15, unit: 'missiles', description: 'A missile armed with a conventional warhead. \n\n Utilizing advanced guidance systems and propulsion technology, missiles can be configured with different payloads to deliver different forms of descruction across the vast distaces of space.'} ,
            {id: 2000, key: 'repair_component', label: 'Repair components', category: 'Operational', subcategory: 'Ship', volumePerUnit: 0.15, unit: 'components', description: 'Material used to repair the ship. \n\n Day-to-day repairs and post-combat patches can save a ship and let it live to fight another day, but it requires the right materials (not to mention the know-how).'},
            {id: 2001, key: 'crew_component', label: 'Medical supplies', category: 'Operational', subcategory: 'Ship', volumePerUnit: 0.15, unit: 'kits', description: 'A kit of medical supplies. Everything from radiation drugs to blood clotters to bone bonders. \n\n You never know what you might need.'},
            {id: 2002, key: 'crew_component', label: 'Food and potable water', category: 'Operational', subcategory: 'Ship', volumePerUnit: 0.15, unit: 'person-days', description: 'Food and water. \n\n You don\'t want to set out on a journey without bringing enough food and water.'},
            {id: 2003, key: 'ship_component', label: 'Reactor fuel', category: 'Operational', subcategory: 'Ship', volumePerUnit: 0.15, unit: 'blocks', description: 'An ultra-dense matter block, used as fuel for the reactor. \n\n Matter reactors require extremely heavy blocks of dense material that put out a lot of radiation, perfect for space travel. A block can power a ship full-blast for a solid week.'},
            {id: 2004, key: 'ship_component', label: 'Air', category: 'Operational', subcategory: 'Ship', volumePerUnit: 0.15, unit: 'liters', description: 'Oxygen and other gasses. \n\n Life support systems need to be able to introduce fresh air to avoid carbon dioxide buildup. Even the best air scrubbers can fail.'},
        ]

        let itemsById = {}
        let allObjects = [...objects, ...this.materials(), ...this.goods()]
        
        allObjects.forEach((item) => {
            itemsById[item.id] = item
        });

        return itemsById;
    }

    static materials() {
        return [
          ]
    }

    static goods() {
        return [
          ];
    }
}