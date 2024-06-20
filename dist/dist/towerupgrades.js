"use strict";
class TowerUpgradeMenu {
    player;
    selectedTower = null;
    sideMenu = document.querySelector('.side-menu');
    constructor(player) {
        this.player = player;
    }
    setTower(tower) {
        this.selectedTower = tower;
        const currentUpgrades = this.selectedTower.listOfUpgrades;
        if (this.selectedTower instanceof LinearTower) {
            let content = `<span>Current Upgrades: `;
            if (currentUpgrades.length === 2) {
                if (currentUpgrades[0] === currentUpgrades[1]) {
                    content += `${currentUpgrades[0]} x2`;
                }
                else {
                    content += `${currentUpgrades[0]} x1, ${currentUpgrades[1]} x1`;
                }
            }
            else if (currentUpgrades.length === 1) {
                content += `${currentUpgrades[0]} x1`;
            }
            else {
                content += `None`;
            }
            content += '</span>';
            if (currentUpgrades.length !== 2) {
                if (!currentUpgrades.includes('Random Bullet Color')) {
                    content += ` <button class="randomize-bullet-color upgrade-button mt-2">Randomize Bullet Color - $${this.selectedTower.upgradeCost}</button>`;
                }
                content += ` <button class="increase-speed upgrade-button mt-2">Increase speed - $${this.selectedTower.upgradeCost}</button>
                <button class="increase-attack upgrade-button mt-2">Increase attack - $${this.selectedTower.upgradeCost}</button>`;
                this.sideMenu.innerHTML = content;
                const increaseSpeedBtn = document.querySelector('.increase-speed');
                const increaseAttackBtn = document.querySelector('.increase-attack');
                const randomizeBulletColorBtn = document.querySelector('.randomize-bullet-color');
                if (randomizeBulletColorBtn) {
                    randomizeBulletColorBtn.addEventListener('click', e => {
                        if (this.selectedTower)
                            this.player.spendMoney(this.selectedTower.upgradeCost);
                        this.selectedTower?.increaseUpgradeCost();
                        this.selectedTower?.addUpgrade('Random Bullet Color');
                        if (this.selectedTower instanceof LinearTower) {
                            this.selectedTower.randomizeBulletColor();
                        }
                    });
                }
                increaseSpeedBtn.addEventListener('click', e => {
                    if (this.selectedTower)
                        this.player.spendMoney(this.selectedTower.upgradeCost);
                    this.selectedTower?.increaseUpgradeCost();
                    this.selectedTower?.addUpgrade('Increase Speed');
                    if (this.selectedTower instanceof LinearTower) {
                        this.selectedTower.upgradeSpeed();
                    }
                });
                increaseAttackBtn.addEventListener('click', e => {
                    if (this.selectedTower)
                        this.player.spendMoney(this.selectedTower.upgradeCost);
                    this.selectedTower?.increaseUpgradeCost();
                    this.selectedTower?.addUpgrade('Increase Attack');
                    if (this.selectedTower instanceof LinearTower) {
                        this.selectedTower.upgradeAttack();
                    }
                });
            }
            else {
                content += `<div>This tower has been maxed out</div>`;
                this.sideMenu.innerHTML = content;
            }
        }
        if (this.selectedTower instanceof DirectionTower) {
            let content = `<span>Current Upgrades: `;
            if (currentUpgrades.length === 2) {
                if (currentUpgrades[0] === currentUpgrades[1]) {
                    content += `${currentUpgrades[0]} x2`;
                }
                else {
                    content += `${currentUpgrades[0]} x1, ${currentUpgrades[1]} x1`;
                }
            }
            else if (currentUpgrades.length === 1) {
                content += `${currentUpgrades[0]} x1`;
            }
            else {
                content += `None`;
            }
            content += '</span>';
            if (currentUpgrades.length !== 2) {
                content += ` <button class="increase-speed upgrade-button mt-2">Increase speed - $${this.selectedTower.upgradeCost}</button>   `;
                if (!this.selectedTower.directions.includes('left')) {
                    content += `<button class="change-direction upgrade-button mt-2" value="left">Add left - $${this.selectedTower.upgradeCost}</button>`;
                }
                if (!this.selectedTower.directions.includes('right')) {
                    content += `<button class="change-direction upgrade-button mt-2" value="right">Add right - $${this.selectedTower.upgradeCost}</button>`;
                }
                if (!this.selectedTower.directions.includes('up')) {
                    content += `<button class="change-direction upgrade-button mt-2" value="up">Add up - $${this.selectedTower.upgradeCost}</button>`;
                }
                if (!this.selectedTower.directions.includes('down')) {
                    content += `<button class="change-direction upgrade-button mt-2" value="down">Add down - $${this.selectedTower.upgradeCost}</button>`;
                }
                this.sideMenu.innerHTML = content;
                const increaseSpeedBtn = document.querySelector('.increase-speed');
                const changeDirectionBtns = document.querySelectorAll('.change-direction');
                if (changeDirectionBtns) {
                    for (let button of changeDirectionBtns) {
                        const changeDirectionBtn = button;
                        changeDirectionBtn.addEventListener('click', e => {
                            if (this.selectedTower instanceof DirectionTower) {
                                this.selectedTower?.addUpgrade(`Add ${changeDirectionBtn.value} direction`);
                                if (this.selectedTower)
                                    this.player.spendMoney(this.selectedTower.upgradeCost);
                                this.selectedTower.increaseUpgradeCost();
                                this.selectedTower.addDirection(changeDirectionBtn.value);
                            }
                        });
                    }
                }
                increaseSpeedBtn.addEventListener('click', e => {
                    if (this.selectedTower instanceof DirectionTower) {
                        if (this.selectedTower)
                            this.player.spendMoney(this.selectedTower.upgradeCost);
                        this.selectedTower?.addUpgrade('Increase Speed');
                        this.selectedTower.upgradeSpeed();
                        this.selectedTower.increaseUpgradeCost();
                    }
                });
            }
            else {
                content += `<div>This tower has been maxed out</div>`;
                this.sideMenu.innerHTML = content;
            }
        }
        if (this.selectedTower instanceof LinearRadiusTower) {
            let firingOptions = `<div class="firing-options">
            <button class="firing-option mt-2" value="furthest">Furthest Enemy</button>
            <button class="firing-option mt-2" value="closest">Closest Enemy</button>
            <button class="firing-option mt-2" value="strongest">Strongest Enemy</button>
            </div>`;
            this.sideMenu.innerHTML = firingOptions;
            setTimeout(() => {
                const firingChoices = document.querySelectorAll('.firing-option');
                if (firingChoices.length > 0) { // Ensure elements are found
                    firingChoices.forEach((button, index) => {
                        const currentButton = button;
                        currentButton.addEventListener('click', e => {
                            if (this.selectedTower instanceof LinearRadiusTower) {
                                this.selectedTower.setFiringMethod(currentButton.value);
                            }
                        });
                    });
                }
                else {
                    console.error('Firing option button not found');
                }
            }, 0);
            let content = `<span>Current Upgrades: `;
            if (currentUpgrades.length === 2) {
                if (currentUpgrades[0] === currentUpgrades[1]) {
                    content += `${currentUpgrades[0]} x2`;
                }
                else {
                    content += `${currentUpgrades[0]} x1, ${currentUpgrades[1]} x1`;
                }
            }
            else if (currentUpgrades.length === 1) {
                content += `${currentUpgrades[0]} x1`;
            }
            else {
                content += `None`;
            }
            content += '</span>';
            if (currentUpgrades.length !== 2) {
                content += ` <button class="increase-speed upgrade-button mt-2">Increase speed - $${this.selectedTower.upgradeCost}</button>
            <button class="increase-firing-radius upgrade-button mt-2">Increase firing radius - $${this.selectedTower.upgradeCost}</button>`;
                this.sideMenu.innerHTML += content;
                const increaseSpeedBtn = document.querySelector('.increase-speed');
                const increaseFiringRadiusBtn = document.querySelector('.increase-firing-radius');
                increaseSpeedBtn.addEventListener('click', e => {
                    // this.player.spendMoney(up)
                    if (this.selectedTower)
                        this.player.spendMoney(this.selectedTower.upgradeCost);
                    if (this.selectedTower instanceof LinearRadiusTower) {
                        this.selectedTower?.addUpgrade('Increase Speed');
                        this.selectedTower.upgradeSpeed();
                        this.selectedTower?.increaseUpgradeCost();
                    }
                });
                increaseFiringRadiusBtn.addEventListener('click', e => {
                    if (this.selectedTower)
                        this.player.spendMoney(this.selectedTower.upgradeCost);
                    this.selectedTower?.increaseUpgradeCost();
                    if (this.selectedTower instanceof LinearRadiusTower) {
                        this.selectedTower?.addUpgrade('Increase Firing Radius');
                        this.selectedTower.upgradeFiringRadius();
                    }
                });
            }
            else {
                content += `<div>This tower has been maxed out</div>`;
                this.sideMenu.innerHTML += content;
            }
        }
        if (this.selectedTower instanceof PathTower) {
            let content = `<span>Current Upgrades: `;
            if (currentUpgrades.length === 2) {
                if (currentUpgrades[0] === currentUpgrades[1]) {
                    content += `${currentUpgrades[0]} x2`;
                }
                else {
                    content += `${currentUpgrades[0]} x1, ${currentUpgrades[1]} x1`;
                }
            }
            else if (currentUpgrades.length === 1) {
                content += `${currentUpgrades[0]} x1`;
            }
            else {
                content += `None`;
            }
            content += '</span>';
            if (currentUpgrades.length !== 2) {
                content += `
                <button class="increase-attack upgrade-button mt-2">Increase attack - $${this.selectedTower.upgradeCost}</button>`;
                this.sideMenu.innerHTML = content;
                // console.log(this.sideMenu.innerHTML)
                const increaseAttackBtn = document.querySelector('.increase-attack');
                increaseAttackBtn.addEventListener('click', e => {
                    if (this.selectedTower)
                        this.player.spendMoney(this.selectedTower.upgradeCost);
                    this.selectedTower?.increaseUpgradeCost();
                    this.selectedTower?.addUpgrade('Increase Attack');
                    if (this.selectedTower instanceof PathTower) {
                        this.selectedTower.upgradeAttack();
                    }
                });
            }
            else {
                content += `<div>This tower has been maxed out</div>`;
                this.sideMenu.innerHTML = content;
            }
        }
    }
    update() {
        if (this.selectedTower) {
            if (this.selectedTower instanceof LinearRadiusTower) {
                const allFiringMethodButtons = document.querySelectorAll('.firing-option');
                for (let button of allFiringMethodButtons) {
                    const currentButton = button;
                    if (currentButton.value === this.selectedTower.firingMethod) {
                        currentButton.disabled = true;
                    }
                    else {
                        currentButton.disabled = false;
                    }
                }
            }
            const allButtons = this.sideMenu.querySelectorAll('.upgrade-button');
            if (this.player.money < this.selectedTower.upgradeCost) {
                for (let button of allButtons) {
                    const currentButton = button;
                    currentButton.disabled = true;
                }
            }
            else {
                for (let button of allButtons) {
                    const currentButton = button;
                    currentButton.disabled = false;
                }
            }
        }
    }
    defaultMenu() {
        console.log('default');
        const content = ` <div class="tower-description-heading">Tower Descriptions</div>
        <span>
          <img src="Images/LinearTower.png" class="tower-img" alt="">
          <span class="tower-description">- Linear Tower</span>
        </span>
        <span>
          <img src="Images/DirectionTower.png" class="tower-img" alt="">
          <span class="tower-description">- Direction Tower</span>
        </span>
        <span>
          <img src="Images/PathTower.png" class="tower-img" alt="">
          <span class="tower-description">- Path Tower</span>
        </span>
        <span>
          <img src="Images/RadiusTower.png" class="tower-img" alt="">
          <span class="tower-description">- Radius Tower</span>`;
        this.sideMenu.innerHTML = content;
    }
}
//# sourceMappingURL=towerupgrades.js.map