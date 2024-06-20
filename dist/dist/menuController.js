"use strict";
// class MenuController {
//     private mouseX: number = 0;
//     private mouseY: number = 0;
//     private _overDirectionTower: boolean = false;
//     private _hoverPlay: boolean = false;
//     public game: Game | undefined;
//     private easyButton: HTMLButtonElement = document.getElementById("easyButton") as HTMLButtonElement;
//     private hardButton: HTMLButtonElement = document.getElementById("hardButton") as HTMLButtonElement;
//     private easyButtonListener: EventListener | undefined;
//     private hardButtonListener: EventListener | undefined;
//     private clickListener: (event: MouseEvent) => void;
//     public get overDirectionTower(): boolean {
//         return this._overDirectionTower;
//     }
//     //you can simiply all of these into 1 method at the end with a parameter
//     public toggleHoverPlay(): void {
//         console.log('here')
//         if (this._hoverPlay) {
//             this._hoverPlay = false;
//         } else {
//             this._hoverPlay = true;
//         }
//     }
//     private updateMousePosition(event: MouseEvent): void {
//         this.mouseX = event.clientX;
//         this.mouseY = event.clientY;
//     }
//     constructor() {
//         document.addEventListener("mousemove", (event) => {
//             this.updateMousePosition(event);
//             // this.playButton(event);
//         });
//         this.clickListener = () => this.handleMouseClickMenu();
//         document.addEventListener("click", this.clickListener);
//         this.toggleHoverPlay();
//     }
//     private handleMouseClickMenu(): void {
//         if (this._hoverPlay && this.mouseX > 200 && this.mouseX < 350 && this.mouseY < 250 && this.mouseY > 150) {
//             CanvasManager.GameCanvas.context.clearRect(0, 0, GameCanvas.WIDTH, GameCanvas.HEIGHT);
//             console.log("GOOD STUFF");
//             document.removeEventListener("click", this.clickListener);
//             const levelSelectionMenuItem = (CanvasManager.GameCanvas.mainMenu as Menu).addCommand(new SelectLevelCommand());
//             levelSelectionMenuItem.executeCommand();
//         }
//     }
//     public addLevelSelectionListeners(): void {
//         this.easyButtonListener = () => this.selectLevel(1);
//         this.easyButton.addEventListener("click", this.easyButtonListener);
//         this.hardButtonListener = () => this.selectLevel(2);
//         this.hardButton.addEventListener("click", this.hardButtonListener);
//     }
//     private selectLevel(num: number): void {
//         SelectLevelCommand.levelSelection.hidden = true;
//         this.easyButton.removeEventListener("click", this.easyButtonListener as EventListener);
//         this.hardButton.removeEventListener("click", this.hardButtonListener as EventListener);
//         CanvasManager.GameCanvas.setGame(num);
//     }
// }
//# sourceMappingURL=menuController.js.map