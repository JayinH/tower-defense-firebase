//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { update, ref,
//@ts-ignore Import module
 } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./firebaseApp.js";
import { CanvasManager } from "./canvasmanager.js";
class Player {
    _nickname;
    mainOrOpponent;
    _id = nanoid(10);
    _money = 225;
    _lives = 20;
    gameInstance;
    won = false;
    lost = false;
    draw = false;
    _isAlive = true;
    constructor(_nickname, mainOrOpponent) {
        this._nickname = _nickname;
        this.mainOrOpponent = mainOrOpponent;
    }
    get nickname() {
        return this._nickname;
    }
    set money(amount) {
        if (this.mainOrOpponent === "opponent") {
            this._money = amount;
        }
        else {
            throw new Error("This method is not available to the main game class");
        }
    }
    set lives(amount) {
        if (this.mainOrOpponent === "opponent") {
            this._lives = amount;
        }
        else {
            throw new Error("This method is not available to the main game class");
        }
    }
    get isAlive() {
        return this._isAlive;
    }
    loseLife() {
        if (this.mainOrOpponent !== "opponent") {
            this._lives--;
            if (this.lives === 0) {
                this._isAlive = false;
            }
            update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}`), {
                lives: this.lives
            }).then(() => { });
        }
    }
    resetStats(gameInstance) {
        this.gameInstance = gameInstance;
        this._lives = 20;
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
        }).then(() => { });
    }
    get id() {
        return this._id;
    }
    get lives() {
        return this._lives;
    }
    get money() {
        return this._money;
    }
    spendMoney(money) {
        if (this.mainOrOpponent !== "opponent") {
            if (money <= 0) {
                throw new Error("Not a valid input");
            }
            this._money -= money;
            update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}`), {
                money: this._money
            }).then(() => {
            });
        }
    }
    receiveMoney(money) {
        if (this.mainOrOpponent !== "opponent") {
            if (money <= 0) {
                throw new Error("Not a valid input");
            }
            this._money += money;
            update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}`), {
                money: this.money
            }).then(() => { });
        }
    }
}
export { Player };
//# sourceMappingURL=player.js.map