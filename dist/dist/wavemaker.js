import { PathBlock } from "./pathclass.js";
class Wave {
    ENEMY_SPAWN_X = PathBlock.startpointX;
    ENEMY_SPAWN_Y = PathBlock.startpointY;
    ENEMY_RADIUS = 20;
    _currentWave = 0;
    constructor() { }
    get currentWave() {
        return this._currentWave;
    }
    /**
     * Depending on the wave number, creates an array of info used to generate a variety of different types of enemies
     * Additionally returns a spawn speed, telling the game how quickly to spawn the enemies
     */
    createNewWave() {
        const enemyInfo = [{ x: 0, y: 0, r: 0, level: 0 }];
        enemyInfo.shift();
        let spawnSpeed = 1000;
        switch (this._currentWave) {
            case 1:
                for (let i = 0; i < 10; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 6 });
                }
                break;
            case 2:
                for (let i = 0; i < 10; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 2 });
                }
                spawnSpeed = 400;
                break;
            case 3:
                for (let i = 0; i < 5; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 1 });
                }
                for (let i = 0; i < 10; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 3 });
                }
                for (let i = 0; i < 3; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 2 });
                }
                for (let i = 0; i < 7; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 1 });
                }
                spawnSpeed = 500;
                break;
            case 4:
                for (let i = 0; i < 20; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 1 });
                }
                for (let i = 0; i < 10; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 3 });
                }
                for (let i = 0; i < 20; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 2 });
                }
                for (let i = 0; i < 10; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 1 });
                }
                spawnSpeed = 200;
                break;
            case 5:
                enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 4 });
                spawnSpeed = 100;
                break;
            case 6:
                for (let i = 0; i < 15; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 5 });
                }
                spawnSpeed = 700;
                break;
            case 7:
                for (let i = 0; i < 10; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 5 });
                }
                for (let i = 0; i < 7; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 6 });
                }
                for (let i = 0; i < 12; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 5 });
                }
                for (let i = 0; i < 8; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 6 });
                }
                for (let i = 0; i < 14; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 5 });
                }
                for (let i = 0; i < 3; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 6 });
                }
                for (let i = 0; i < 8; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 5 });
                }
                for (let i = 0; i < 6; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 6 });
                }
                spawnSpeed = 800;
                break;
            case 8:
                for (let i = 0; i < 15; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 6 });
                }
                for (let i = 0; i < 15; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 5 });
                }
                for (let i = 0; i < 70; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 6 });
                }
                spawnSpeed = 900;
                break;
            case 9:
                for (let i = 0; i < 20; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 3 });
                }
                for (let i = 0; i < 20; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 2 });
                }
                for (let i = 0; i < 20; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 2 });
                }
                for (let i = 0; i < 20; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 5 });
                }
                for (let i = 0; i < 3; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 4 });
                }
                for (let i = 0; i < 30; i++) {
                    enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 6 });
                }
                spawnSpeed = 500;
                break;
            case 10:
                enemyInfo.push({ x: this.ENEMY_SPAWN_X, y: this.ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: 7 });
        }
        this._currentWave++;
        return [enemyInfo, spawnSpeed];
    }
}
export { Wave };
//# sourceMappingURL=wavemaker.js.map