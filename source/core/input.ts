/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

module pow2 {
    export enum KeyCode {
        UP = 38,
        DOWN = 40,
        LEFT = 37,
        RIGHT = 39,
        BACKSPACE = 8,
        COMMA = 188,
        DELETE = 46,
        END = 35,
        ENTER = 13,
        ESCAPE = 27,
        HOME = 36,
        SPACE = 32,
        TAB = 9
    }

    export class Input {
        _keysDown:Object = {};
        constructor() {
            window.addEventListener(<string>"keydown", (ev:KeyboardEvent) => {
                this._keysDown[ev.which] = true;
            });
            window.addEventListener(<string>'keyup', (ev:KeyboardEvent) => {
                this._keysDown[ev.which] = false;
            });
        }

        keyDown(key:number):boolean {
            return !!this._keysDown[key];
        }
    }
}