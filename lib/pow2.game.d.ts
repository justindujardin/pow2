/// <reference path="pow2.d.ts" />
/// <reference path="../types/backbone/backbone.d.ts" />
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
declare module pow2 {
    class TileMapCameraComponent extends CameraComponent {
        host: TileMap;
        connectComponent(): boolean;
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
declare module pow2 {
    class TileMap extends SceneObject {
        map: TiledTMXResource;
        tiles: any;
        scene: Scene;
        features: any;
        zones: any;
        mapName: string;
        bounds: Rect;
        dirtyLayers: boolean;
        private _loaded;
        constructor(mapName: string);
        onAddToScene(scene: any): void;
        load(mapName?: string): void;
        isLoaded(): boolean;
        loaded(): void;
        unloaded(): void;
        setMap(map: TiledTMXResource): boolean;
        getLayers(): tiled.ITiledLayer[];
        getLayer(name: string): tiled.ITiledLayer;
        getTerrain(layer: string, x: number, y: number): any;
        getTileData(layer: tiled.ITiledLayer, x: number, y: number): any;
        getTileGid(layer: string, x: number, y: number): number;
        getTileMeta(gid: number): tiled.ITileInstanceMeta;
        getTerrainTexture(x: any, y: any): any;
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
declare module pow2 {
    interface TileObjectOptions {
        point?: Point;
        renderPoint?: Point;
        image?: HTMLImageElement;
        scale?: number;
        visible?: boolean;
        enabled?: boolean;
        tileMap: TileMap;
        icon?: string;
        meta?: any;
        frame?: number;
    }
    class TileObject extends SceneObject implements TileObjectOptions {
        point: Point;
        renderPoint: Point;
        image: HTMLImageElement;
        visible: boolean;
        enabled: boolean;
        tileMap: TileMap;
        scale: number;
        icon: string;
        meta: any;
        frame: number;
        world: SceneWorld;
        constructor(options?: TileObjectOptions);
        setPoint(point: Point): void;
        /**
         * When added to a scene, resolve a feature icon to a renderable sprite.
         */
        onAddToScene(): void;
        /**
         * Set the current sprite name.  Returns the previous sprite name.
         */
        setSprite(name: string, frame?: number): string;
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
declare module pow2 {
    class TileComponent extends SceneComponent {
        tileMap: TileMap;
        host: TileObject;
        isEntered: boolean;
        syncComponent(): boolean;
        disconnectComponent(): boolean;
        enter(object: TileObject): boolean;
        entered(object: TileObject): boolean;
        exit(object: TileObject): boolean;
        exited(object: TileObject): boolean;
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
declare module pow2 {
    class TileObjectRenderer extends SceneObjectRenderer {
        private _renderPoint;
        render(object: any, data: any, view: SceneView): void;
    }
}
declare module pow2 {
    class TileMapRenderer extends SceneObjectRenderer {
        buffer: HTMLCanvasElement[][];
        bufferMapName: string;
        bufferComplete: boolean;
        private _clipRect;
        private _renderRect;
        render(object: TileMap, view: TileMapView): void;
    }
}
declare module pow2 {
    class TileMapView extends SceneView {
        objectRenderer: TileObjectRenderer;
        mapRenderer: TileMapRenderer;
        tileMap: TileMap;
        world: SceneWorld;
        setTileMap(tileMap: TileMap): void;
        setScene(scene: Scene): void;
        getCameraClip(): Rect;
        setRenderState(): void;
        renderFrame(elapsed: any): TileMapView;
        renderPost(): void;
        renderAnalog(): TileMapView;
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
declare module pow2 {
    interface SpriteComponentOptions {
        icon: string;
        name?: string;
        frame?: number;
    }
    class SpriteComponent extends SceneComponent {
        host: TileObject;
        image: HTMLImageElement;
        visible: boolean;
        enabled: boolean;
        icon: string;
        meta: any;
        frame: number;
        constructor(options?: SpriteComponentOptions);
        connectComponent(): boolean;
        /**
         * Set the current sprite name.  Returns the previous sprite name.
         */
        setSprite(name: string, frame?: number): string;
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
declare module pow2 {
    interface AnimatedSpriteComponentOptions {
        lengthMS?: number;
        spriteName: string;
    }
    class AnimatedSpriteComponent extends TickedComponent {
        host: TileObject;
        _elapsed: number;
        private _renderFrame;
        lengthMS: number;
        spriteComponent: SpriteComponent;
        spriteName: string;
        constructor(options?: AnimatedSpriteComponentOptions);
        connectComponent(): boolean;
        syncComponent(): boolean;
        tick(elapsed: number): void;
        interpolateTick(elapsed: number): void;
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
declare module pow2 {
    interface EntityModelOptions {
        name: string;
        icon: string;
        level?: number;
        hp?: number;
        maxHP?: number;
        exp?: number;
        strength?: number;
        vitality?: number;
        intelligence?: number;
        agility?: number;
        dead?: boolean;
        evade: number;
        hitpercent: number;
    }
    class EntityModel extends Backbone.Model {
        static BASE_CHANCE_TO_HIT: number;
        static BASE_EVASION: number;
        static DEFAULTS: EntityModelOptions;
        defaults(): any;
        rollHit(defender: EntityModel): boolean;
        damage(amount: number): number;
        getEvasion(): number;
        isDefeated(): boolean;
        attack(defender: EntityModel): number;
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
declare module pow2 {
    class GameEntityObject extends TileObject {
        tileMap: GameTileMap;
        model: EntityModel;
        feature: any;
        type: string;
        groups: any;
        constructor(options: any);
        isDefeated(): boolean;
        getIcon(): string;
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
declare module pow2 {
    class CombatStateMachine extends StateMachine {
        parent: GameStateMachine;
        defaultState: string;
        states: IState[];
        party: GameEntityObject[];
        enemies: GameEntityObject[];
        turnList: GameEntityObject[];
        focus: GameEntityObject;
        current: GameEntityObject;
        currentDone: boolean;
        isFriendlyTurn(): boolean;
        getLiveParty(): GameEntityObject[];
        getLiveEnemies(): GameEntityObject[];
        getRandomPartyMember(): GameEntityObject;
        getRandomEnemy(): GameEntityObject;
        partyDefeated(): boolean;
        enemiesDefeated(): boolean;
        keyListener: any;
        constructor(parent: GameStateMachine);
    }
    class GameCombatState extends State {
        static NAME: string;
        name: string;
        machine: CombatStateMachine;
        parent: GameStateMachine;
        tileMap: GameTileMap;
        finished: boolean;
        enter(machine: GameStateMachine): void;
        exit(machine: GameStateMachine): void;
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
declare module pow2 {
    class GameDefaultState extends State {
        static NAME: string;
        name: string;
    }
    class GameStateMachine extends StateMachine {
        world: GameWorld;
        model: GameStateModel;
        defaultState: string;
        player: TileObject;
        encounterInfo: IZoneMatch;
        encounter: IGameEncounter;
        states: IState[];
        onAddToWorld(world: any): void;
        setCurrentState(newState: any): boolean;
        update(data?: any): void;
    }
}
/**
 Copyright (C) 2014 by Justin DuJardin

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
declare module pow2 {
    /**
     * Use TableTop to load a published google spreadsheet.
     */
    class GameDataResource extends Resource {
        static DATA_KEY: string;
        load(): void;
        getCache(): any;
        static clearCache(): void;
        setCache(data: any): void;
        static NUMBER_MATCHER: RegExp;
        transformTypes(data: any): any;
        getSheetData(name: string): any;
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
declare module pow2 {
    class GameWorld extends SceneWorld {
        state: GameStateMachine;
        model: GameStateModel;
        combatScene: Scene;
        scene: Scene;
        constructor(services?: any);
        randomEncounter(zone: IZoneMatch): void;
        fixedEncounter(zone: IZoneMatch, encounterId: string): void;
        private _encounter(zoneInfo, encounter);
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
declare module pow2 {
    /**
     * Describe a set of combat zones for a given point on a map.
     */
    interface IZoneMatch {
        map: string;
        target: string;
        targetPoint: Point;
    }
    class GameTileMap extends TileMap {
        world: GameWorld;
        featureHash: any;
        graph: any;
        loaded(): void;
        destroy(): void;
        unloaded(): void;
        featureKey(x: any, y: any): string;
        getFeature(name: string): any;
        addFeature(feature: any): void;
        indexFeature(obj: GameFeatureObject): void;
        addFeaturesToScene(): void;
        removeFeaturesFromScene(): void;
        buildFeatures(): boolean;
        createFeatureObject(tiledObject: tiled.ITiledObject): TileObject;
        buildAStarGraph(): void;
        calculatePath(from: Point, to: Point): Point[];
        /**
         * Enumerate the map and target combat zones for a given position on this map.
         * @param at The position to check for a sub-zone in the map
         * @returns {IZoneMatch} The map and target zones that are null if they don't exist
         */
        getCombatZones(at: Point): IZoneMatch;
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
declare module pow2 {
    class GameComponent extends TileComponent {
        feature: any;
        host: GameFeatureObject;
        tileMap: GameTileMap;
        scene: Scene;
        syncComponent(): boolean;
        disconnectComponent(): boolean;
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
declare module pow2 {
    class GameMapView extends TileMapView {
        objectRenderer: TileObjectRenderer;
        tileMap: GameTileMap;
        mouse: NamedMouseElement;
        scene: Scene;
        constructor(canvas: HTMLCanvasElement, loader: any);
        onAddToScene(scene: Scene): void;
        onRemoveFromScene(scene: Scene): void;
        mouseClick(e: any): boolean;
        processCamera(): void;
        private _features;
        private _players;
        private _playerRenders;
        private _sprites;
        private _movers;
        syncComponents(): void;
        renderFrame(elapsed: any): GameMapView;
        debugRender(debugStrings?: string[]): void;
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
declare module pow2 {
    class ItemModel extends Backbone.Model {
        static DEFAULTS: IGameItem;
        defaults(): any;
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
declare module pow2 {
    class ArmorModel extends ItemModel {
        static DEFAULTS: IGameArmor;
        defaults(): any;
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
declare module pow2 {
    class GameStateModel extends Events {
        party: HeroModel[];
        inventory: ItemModel[];
        loader: ResourceLoader;
        keyData: {
            [x: string]: any;
        };
        gold: number;
        combatZone: string;
        constructor(options?: any);
        initData(then?: (data: GameDataResource) => any): void;
        /**
         * Get the game data sheets from google and callback when they're loaded.
         * @param then The function to call when spreadsheet data has been fetched
         */
        static getDataSource(then?: (data: GameDataResource) => any): void;
        setKeyData(key: string, data: any): void;
        getKeyData(key: string): any;
        addInventory(item: ItemModel): ItemModel;
        removeInventory(item: ItemModel): boolean;
        addHero(model: HeroModel): void;
        addGold(amount: number): void;
        parse(data: any, options?: any): void;
        toJSON(): any;
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
declare module pow2 {
    class WeaponModel extends ItemModel {
        static DEFAULTS: IGameWeapon;
        defaults(): any;
        isNoWeapon(): boolean;
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
declare module pow2 {
    var HeroTypes: any;
    interface HeroModelOptions extends EntityModelOptions {
        type: string;
        description: string;
        combatSprite: string;
        baseStrength: number;
        baseAgility: number;
        baseIntelligence: number;
        baseVitality: number;
        hitPercentPerLevel: number;
        nextLevelExp: number;
        prevLevelExp: number;
    }
    class HeroModel extends EntityModel {
        static MAX_LEVEL: number;
        static MAX_ATTR: number;
        static ARMOR_TYPES: string[];
        weapon: WeaponModel;
        head: ArmorModel;
        body: ArmorModel;
        arms: ArmorModel;
        feet: ArmorModel;
        accessory: ArmorModel;
        game: GameStateModel;
        static DEFAULTS: HeroModelOptions;
        defaults(): any;
        equipArmor(item: ArmorModel): ArmorModel;
        unequipArmor(item: ArmorModel): boolean;
        getEvasion(): number;
        attack(defender: EntityModel): number;
        getXPForLevel(level?: any): number;
        getDefense(): number;
        getDamage(): number;
        awardExperience(exp: number): boolean;
        awardLevelUp(): void;
        parse(data: any, options?: any): any;
        toJSON(): any;
        getHPForLevel(level?: number): number;
        getStrengthForLevel(level?: number): number;
        getAgilityForLevel(level?: number): number;
        getVitalityForLevel(level?: number): number;
        getIntelligenceForLevel(level?: number): number;
        static create(type: string, name: string): HeroModel;
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
declare module pow2 {
    interface CreatureModelOptions extends EntityModelOptions {
        name: string;
        icon: string;
        groups: string[];
        level: number;
        hp: number;
        strength: number;
        numAttacks: number;
        armorClass: number;
        description: string;
    }
    class CreatureModel extends EntityModel {
        static DEFAULTS: CreatureModelOptions;
        defaults(): any;
        attack(defender: EntityModel): number;
        static fromName(name: string): CreatureModel;
        static fromLevel(level: number): CreatureModel;
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
declare module pow2 {
    class CombatState extends State {
        enter(machine: StateMachine): void;
        exit(machine: StateMachine): void;
        keyPress(machine: StateMachine, keyCode: KeyCode): boolean;
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
declare module pow2 {
    class GameMapState extends State {
        static NAME: string;
        name: string;
        mapName: string;
        mapPoint: Point;
        constructor(name: string);
        enter(machine: GameStateMachine): void;
        exit(machine: GameStateMachine): void;
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
declare module pow2 {
    class GameFeatureObject extends TileObject {
        id: string;
        world: GameWorld;
        tileMap: GameTileMap;
        feature: any;
        type: string;
        passable: boolean;
        groups: any[];
        category: any;
        frame: number;
        constructor(options: any);
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
declare module pow2 {
    interface IAnimationConfig {
        name: string;
        duration: number;
        repeats?: number;
        frames?: any[];
        move?: Point;
        callback?: (config: IAnimationConfig) => void;
    }
    interface IAnimationTask extends IAnimationConfig {
        elapsed?: number;
        start?: any;
        target?: any;
        value: any;
        complete?: boolean;
        startFrame: number;
        done?: (config: IAnimationConfig) => void;
    }
    class AnimatedComponent extends TickedComponent {
        host: TileObject;
        static EVENTS: {
            Started: string;
            Stopped: string;
            Repeated: string;
        };
        private _tasks;
        private _animationKeys;
        private _currentAnim;
        play(config: IAnimationConfig): void;
        stop(config: IAnimationConfig): void;
        removeCompleteTasks(): void;
        interpolateTick(elapsed: number): void;
        update(elapsed: number): void;
        interpolate(from: number, to: number, factor: number): number;
        playChain(animations: IAnimationConfig[], cb: () => void): void;
        private _animateNext();
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
declare module pow2 {
    enum MoveFrames {
        LEFT = 10,
        RIGHT = 4,
        DOWN = 7,
        UP = 1,
        LEFTALT = 11,
        RIGHTALT = 5,
        DOWNALT = 8,
        UPALT = 2,
    }
    enum Headings {
        WEST = 0,
        EAST = 1,
        SOUTH = 2,
        NORTH = 3,
    }
    class PlayerRenderComponent extends TickedComponent {
        host: TileObject;
        private _animator;
        heading: Headings;
        animating: boolean;
        connectComponent(): boolean;
        setHeading(direction: Headings, animating: boolean): void;
        setMoving(moving: boolean): void;
        interpolateTick(elapsed: number): void;
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
declare module pow2 {
    class PlayerComponent extends MovableComponent {
        host: TileObject;
        passableKeys: string[];
        collideTypes: string[];
        private _lastFrame;
        private _renderFrame;
        heading: Point;
        sprite: PlayerRenderComponent;
        syncComponent(): boolean;
        tick(elapsed: number): void;
        interpolateTick(elapsed: number): void;
        collideMove(x: number, y: number, results?: GameFeatureObject[]): boolean;
        beginMove(from: Point, to: Point): void;
        endMove(from: Point, to: Point): void;
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
declare module pow2 {
    class DamageComponent extends SceneComponent {
        host: GameEntityObject;
        animation: AnimatedSpriteComponent;
        sprite: SpriteComponent;
        sound: SoundComponent;
        started: boolean;
        syncComponent(): boolean;
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
declare module pow2 {
    /**
     * A component that defines the functionality of a map feature.
     */
    class GameFeatureComponent extends GameComponent {
        host: GameFeatureObject;
        syncComponent(): boolean;
        /**
         * Hide and disable a feature object in a persistent manner.
         * @param hidden Whether to hide or unhide the object.
         */
        setDataHidden(hidden?: boolean): void;
        /**
         * Determine if a feature has been persistently hidden by a call
         * to `hideFeature`.
         */
        getDataHidden(): boolean;
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
declare module pow2 {
    class GameFeatureInputComponent extends TickedComponent {
        hitBox: Rect;
        hits: TileObject[];
        mouse: NamedMouseElement;
        syncComponent(): boolean;
        tick(elapsed: number): void;
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
declare module pow2 {
    class PlayerCameraComponent extends CameraComponent {
        host: TileObject;
        connectComponent(): boolean;
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
declare module pow2 {
    /**
     * A Component that collides with features that are directly in front
     * of a player, that the player is 'touching' by facing them.
     */
    class PlayerTouchComponent extends TickedComponent {
        host: TileObject;
        collider: CollisionComponent;
        player: PlayerComponent;
        touch: GameFeatureObject;
        touchedComponent: GameFeatureComponent;
        syncComponent(): boolean;
        tick(elapsed: number): void;
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
declare module pow2 {
    class CombatFeatureComponent extends GameFeatureComponent {
        party: PlayerComponent;
        enter(object: GameFeatureObject): boolean;
        exited(object: GameFeatureObject): boolean;
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
declare module pow2 {
    class DialogFeatureComponent extends GameFeatureComponent {
        title: string;
        text: string;
        icon: string;
        syncComponent(): boolean;
        enter(object: TileObject): boolean;
        exit(object: TileObject): boolean;
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
declare module pow2 {
    class PortalFeatureComponent extends GameFeatureComponent {
        map: string;
        target: Point;
        syncComponent(): boolean;
        entered(object: TileObject): boolean;
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
declare module pow2 {
    class ShipFeatureComponent extends GameFeatureComponent {
        party: PlayerComponent;
        partyObject: TileObject;
        partySprite: string;
        syncComponent(): boolean;
        enter(object: GameFeatureObject): boolean;
        entered(object: GameFeatureObject): boolean;
        /**
         * Board an object onto the ship component.  This will modify the
         * @param object
         */
        board(object: GameFeatureObject): boolean;
        disembark(at?: Point): void;
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
declare module pow2 {
    class StoreFeatureComponent extends GameFeatureComponent {
        name: string;
        inventory: any[];
        syncComponent(): boolean;
        disconnectComponent(): boolean;
        enter(object: TileObject): boolean;
        exit(object: TileObject): boolean;
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
declare module pow2 {
    class TempleFeatureComponent extends GameFeatureComponent {
        cost: string;
        icon: string;
        syncComponent(): boolean;
        enter(object: TileObject): boolean;
        exit(object: TileObject): boolean;
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
declare module pow2 {
    class TreasureFeatureComponent extends GameFeatureComponent {
        gold: number;
        item: string;
        icon: string;
        syncComponent(): boolean;
        enter(object: TileObject): boolean;
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
declare module pow2 {
    var COMBAT_ENCOUNTERS: {
        FIXED: string;
        RANDOM: string;
    };
    interface IGameEncounter {
        type: string;
        id: string;
        zones: string[];
        enemies: string[];
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
declare module pow2 {
    class CombatCameraComponent extends CameraComponent {
        host: GameTileMap;
        connectComponent(): boolean;
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
declare module pow2.combat {
    enum StateFrames {
        DEFAULT = 10,
        SWING = 1,
        INJURED = 2,
        WALK = 3,
        STRIKE = 3,
        CELEBRATE = 4,
        DEAD = 5,
    }
    class PlayerCombatRenderComponent extends TickedComponent {
        host: GameEntityObject;
        _elapsed: number;
        private _renderFrame;
        state: string;
        animating: boolean;
        animator: AnimatedComponent;
        syncComponent(): boolean;
        tick(elapsed: number): void;
        setState(name?: string): void;
        attack(attackCb: () => any, cb?: () => void): void;
        getAttackAnimation(strikeCb: () => any): {}[];
        _attack(attackCb: () => any, cb?: () => void): void;
        interpolateTick(elapsed: number): void;
    }
}
declare module pow2 {
    class GameCombatView extends TileMapView {
        world: GameWorld;
        objectRenderer: TileObjectRenderer;
        mouse: NamedMouseElement;
        constructor(canvas: HTMLCanvasElement, loader: any);
        onAddToScene(scene: Scene): void;
        onRemoveFromScene(scene: Scene): void;
        mouseClick(e: any): void;
        processCamera(): void;
        renderFrame(elapsed: any): GameCombatView;
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
declare module pow2 {
    class CombatBeginTurnState extends CombatState {
        static NAME: string;
        name: string;
        transitions: IStateTransition[];
        attacksLeft: number;
        current: GameEntityObject;
        machine: CombatStateMachine;
        enter(machine: CombatStateMachine): void;
        exit(machine: CombatStateMachine): void;
        sceneClick(mouse: any, hits: any): void;
        keyPress(machine: CombatStateMachine, keyCode: KeyCode): boolean;
        attack(machine: CombatStateMachine, defender?: GameEntityObject): void;
    }
    class CombatBeginTurnTransition extends StateTransition {
        targetState: string;
        evaluate(machine: CombatStateMachine): boolean;
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
declare module pow2 {
    class CombatDefeatState extends CombatState {
        static NAME: string;
        name: string;
        enter(machine: CombatStateMachine): void;
        update(machine: CombatStateMachine): void;
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
declare module pow2 {
    class CombatEndTurnState extends CombatState {
        static NAME: string;
        name: string;
        transitions: IStateTransition[];
        enter(machine: CombatStateMachine): void;
    }
    class CombatEndTurnTransition extends StateTransition {
        targetState: string;
        evaluate(machine: CombatStateMachine): boolean;
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
declare module pow2 {
    class CombatStartState extends CombatState {
        static NAME: string;
        name: string;
        transitions: IStateTransition[];
        enter(machine: CombatStateMachine): void;
    }
    class CombatStartTransition extends StateTransition {
        targetState: string;
        evaluate(machine: CombatStateMachine): boolean;
    }
    class CombatCompletedTransition extends StateTransition {
        targetState: string;
        evaluate(machine: CombatStateMachine): boolean;
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
declare module pow2 {
    interface CombatVictorySummary {
        party: GameEntityObject[];
        enemies: GameEntityObject[];
        levels: HeroModel[];
        gold: number;
        exp: number;
        state: CombatVictoryState;
    }
    class CombatVictoryState extends CombatState {
        static NAME: string;
        name: string;
        enter(machine: CombatStateMachine): void;
        update(machine: CombatStateMachine): void;
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
declare module pow2 {
    /**
     * A component that defines the functionality of a map feature.
     */
    class CombatEncounterComponent extends SceneComponent {
        host: GameTileMap;
        battleCounter: number;
        combatFlag: boolean;
        combatZone: string;
        isDangerous: boolean;
        world: GameWorld;
        connectComponent(): boolean;
        disconnectComponent(): boolean;
        player: GameEntityObject;
        syncComponent(): boolean;
        moveProcess(player: PlayerComponent, from: Point, to: Point): boolean;
        resetBattleCounter(): void;
        triggerCombat(at: Point): void;
        private _setCounter(value);
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
declare module pow2.combat {
    class MageCombatRenderComponent extends PlayerCombatRenderComponent {
        getAttackAnimation(strikeCb: () => any): {
            name: string;
            callback: () => void;
        }[];
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
declare module pow2.combat {
    class WarriorCombatRenderComponent extends PlayerCombatRenderComponent {
        getAttackAnimation(strikeCb: () => any): {}[];
    }
}
