/// <reference path="../types/backbone/backbone.d.ts" />
/// <reference path="../types/angularjs/angular.d.ts" />
/// <reference path="../web/bower/pow-core/lib/pow-core.d.ts" />
/// <reference path="pow2.game.d.ts" />
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
declare module pow2.ui {
    var app: ng.IModule;
}
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
declare module pow2.ui {
    class PowGameService {
        compile: ng.ICompileService;
        scope: ng.IRootScopeService;
        loader: ResourceLoader;
        world: GameWorld;
        tileMap: GameTileMap;
        sprite: GameEntityObject;
        machine: GameStateMachine;
        currentScene: Scene;
        private _renderCanvas;
        private _canvasAcquired;
        private _stateKey;
        constructor(compile: ng.ICompileService, scope: ng.IRootScopeService);
        getSaveData(): any;
        resetGame(): void;
        saveGame(data: any): void;
        createPlayer(from: HeroModel, at?: Point): void;
        loadMap(mapName: string, then?: () => any, player?: HeroModel, at?: Point): void;
        newGame(then?: () => any): void;
        loadGame(data: any, then?: () => any): void;
        /**
         * Returns a canvas rendering context that may be drawn to.  A corresponding
         * call to releaseRenderContext will return the drawn content of the context.
         */
        getRenderContext(width: number, height: number): CanvasRenderingContext2D;
        /**
         * Call this after getRenderContext to finish rendering and have the source
         * of the canvas content returned as a data url string.
         */
        releaseRenderContext(): string;
        /**
         * Extract the browser location query params
         * http://stackoverflow.com/questions/9241789/how-to-get-url-params-with-javascript
         */
        qs(): any;
    }
}
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
declare module pow2.ui {
}
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
declare module pow2.ui {
}
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
declare module pow2.ui {
    interface IPowAlertObject {
        message: string;
        duration?: number;
        elapsed?: number;
        dismissed?: boolean;
        busy?: boolean;
        done?(message: IPowAlertObject): any;
    }
    interface IAlertScopeService extends ng.IRootScopeService {
        powAlert: IPowAlertObject;
    }
    interface IPowAlertService {
        show(message: string): IPowAlertObject;
        queue(config: IPowAlertObject): any;
    }
    /**
     * Provide a basic service for queuing and showing messages to the user.
     */
    class PowAlertService extends Events implements IWorldObject, IProcessObject, IPowAlertService {
        element: JQuery;
        document: any;
        scope: IAlertScopeService;
        timeout: ng.ITimeoutService;
        game: PowGameService;
        animate: any;
        world: GameWorld;
        _uid: string;
        paused: boolean;
        containerSearch: string;
        container: ng.IAugmentedJQuery;
        private _current;
        private _queue;
        private _dismissBinding;
        constructor(element: JQuery, document: any, scope: IAlertScopeService, timeout: ng.ITimeoutService, game: PowGameService, animate: any);
        onAddToWorld(world: IWorld): void;
        onRemoveFromWorld(world: IWorld): void;
        tick(elapsed: number): void;
        destroy(): void;
        show(message: string, done?: () => void, duration?: number): IPowAlertObject;
        queue(config: IPowAlertObject): IPowAlertObject;
        processFrame(elapsed: number): void;
        dismiss(): void;
    }
}
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
declare module pow2.ui {
}
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
declare module pow2.ui {
}
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
declare module pow2.ui {
}
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
declare module pow2.ui {
}
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
declare module pow2.ui {
}
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
declare module pow2.ui {
    class EditorCameraComponent extends CameraComponent {
        process(view: SceneView): void;
    }
}
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
declare module pow2.ui {
}
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
declare module pow2.ui {
}
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
declare module pow2.ui {
    class MainMenuController {
        $scope: any;
        static $inject: string[];
        constructor($scope: any);
        getClassIcon(classData: any): any;
        getItemClass(classData: any): string;
        previousClass(): void;
        nextClass(): void;
    }
}
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
declare module pow2.ui {
}
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
declare module pow2.ui {
}
