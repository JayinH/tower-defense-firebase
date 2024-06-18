import { Command } from "./command.js";

//Composite Design Pattern
interface Menu {
    readonly description:string;
    addCommand(c:Command):Menu;
    executeCommand():void;
}

interface DisplayMenu {
    displayItems():void;
}

//Menus that can hold other menus
class CompositeMenu implements Menu,DisplayMenu {
    private _items: Menu [] =[];
    private command :Command | undefined;
    constructor(readonly description: string) {}
    
    public get items():Menu[] {
        return this._items;
    }

    //builder design pattern
    public addMenuItem(m:Menu):CompositeMenu {
        //Validation
        this._items.push(m);
        return this;
    }

    public addCommand(c:Command):CompositeMenu {
        //validation
        this.command = c;
        return this;
    }

    public executeCommand():void {
        if (!this.command) throw new Error(`${this} is missing a command!`);
        this.command.execute();
    }

    public displayItems():void {
        for (let i=0;i<this._items.length;i++) {
            console.log(`${this._items[i].description}`);
        }
    }
}

//Used from in class code
class MenuItem implements Menu {
    private command :Command | undefined;
    constructor(readonly description: string) {}
    

    public addCommand(c:Command):MenuItem {
        //validation
        this.command = c;
        return this;
    }

    public executeCommand():void {
        if (!this.command) throw new Error(`${this} is missing a command!`);
        this.command.execute();
    }
}

export {Menu, CompositeMenu, MenuItem}