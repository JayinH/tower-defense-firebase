//Menus that can hold other menus
class CompositeMenu {
    description;
    _items = [];
    command;
    constructor(description) {
        this.description = description;
    }
    get items() {
        return this._items;
    }
    //builder design pattern
    addMenuItem(m) {
        //Validation
        this._items.push(m);
        return this;
    }
    addCommand(c) {
        //validation
        this.command = c;
        return this;
    }
    executeCommand() {
        if (!this.command)
            throw new Error(`${this} is missing a command!`);
        this.command.execute();
    }
    displayItems() {
        for (let i = 0; i < this._items.length; i++) {
            console.log(`${this._items[i].description}`);
        }
    }
}
//Used from in class code
class MenuItem {
    description;
    command;
    constructor(description) {
        this.description = description;
    }
    addCommand(c) {
        //validation
        this.command = c;
        return this;
    }
    executeCommand() {
        if (!this.command)
            throw new Error(`${this} is missing a command!`);
        this.command.execute();
    }
}
export { CompositeMenu, MenuItem };
//# sourceMappingURL=menu.js.map