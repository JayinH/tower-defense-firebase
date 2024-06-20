//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import {
    set,
    onDisconnect,
    onValue,
    push,
    remove,
    update,
    get,
    onChildAdded,
    onChildRemoved,
    ref,
    //@ts-ignore Import module
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./firebaseApp.js";
import { CanvasManager } from "./canvasmanager.js";
interface PlayerInformation {
    money: number;
    lives: number;
    isAlive: boolean;
    loseLife(): void;
    spendMoney(money: number): void;
    receiveMoney(money: number): void;
}

class Player implements PlayerInformation {
    private _id: string = nanoid(10);
    private _money: number = 225;
    private _lives: number = 20;
    private gameInstance: string
    public won = false;
    public lost = false;
    public draw = false;
    private _isAlive: boolean = true;
    constructor(private _nickname: string, private mainOrOpponent?: string) {
    }

    public get nickname() {
        return this._nickname
    }

    public set money(amount: number) {
        if (this.mainOrOpponent === "opponent") {
            this._money = amount;
        } else {
            throw new Error("This method is not available to the main game class")
        }
    }

    public set lives(amount: number) {
        if (this.mainOrOpponent === "opponent") {
            this._lives = amount;
        } else {
            throw new Error("This method is not available to the main game class")
        }
    }

    public get isAlive(): boolean {
        return this._isAlive;
    }

    public loseLife() {
        if (this.mainOrOpponent !== "opponent") {
            this._lives--;
            if (this.lives === 0) {
                this._isAlive = false;
            }
            update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}`), {
                lives: this.lives
            }).then(() => { })
        }
    }

    public resetStats(gameInstance: string) {
        this.gameInstance = gameInstance;
        this._lives = 1;
        this._money = 225;
        this._isAlive = true;
        this.won = false;
        this.lost = false;
        update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}`), {
            lives: this.lives,
            money: this._money,
            isAlive: this._isAlive,
            won: this.won,
            lost: this.lost
        }).then(() => { })
    }

    public get id(): string {
        return this._id;
    }

    public get lives(): number {
        return this._lives;
    }


    public get money() {
        return this._money;
    }

    public spendMoney(money: number) {

        if (this.mainOrOpponent !== "opponent") {
            if (money <= 0) {
                throw new Error("Not a valid input");
            }

            this._money -= money;
            update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}`), {
                money: this._money
            }).then(() => { 
            })
        }
    }

    public receiveMoney(money: number) {
        if (this.mainOrOpponent !== "opponent") {
            if (money <= 0) {
                throw new Error("Not a valid input");
            }
            this._money += money;
            update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}`), {
                money: this.money
            }).then(() => { })
        }
    }
}

export { Player }