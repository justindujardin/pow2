<a name="0.0.22"></a>
### 0.0.22 (2014-11-28)


#### Bug Fixes

* support for astar path weights with multiple layers ([658c8063](http://github.com/justindujardin/pow2/commit/658c8063542ada06e4068aa908daa94985899213))
* issue where player would not collide with features ([dcddb582](http://github.com/justindujardin/pow2/commit/dcddb582d7725750c0d66de5199041f851af4104))
* travis karma build and firefox ([c5c98dfd](http://github.com/justindujardin/pow2/commit/c5c98dfd3727c688c978d31fbe7ce7cd76c5caf7))
* state machine turn deadlocks in combat ([3d1ffc61](http://github.com/justindujardin/pow2/commit/3d1ffc616dfeb713aa93f8d5b1eea286deda36c5))
* deadlock in combat state alert dismissal ([b6d3b913](http://github.com/justindujardin/pow2/commit/b6d3b9134003334d2a9f800d134984bbda876886))
* null ref error in tileMap unload when scene is dead ([b8a6ebf4](http://github.com/justindujardin/pow2/commit/b8a6ebf412604cffd9e9be9128556e414aa8dd25))
* parse negative numbers from spreadsheet ([645d1fd1](http://github.com/justindujardin/pow2/commit/645d1fd187dc59f4f340929d27c2d9c11a0b457d))
* **TileMapRenderer:** render tilemap with pow-core properly ([52c7e487](http://github.com/justindujardin/pow2/commit/52c7e4873100257b4676e355719ddc67485c50cf))
* **audio:** load must be called on audio for ios ([d49f3fae](http://github.com/justindujardin/pow2/commit/d49f3faeed6778ef3b64c1c5f6804f9082ae8c62))
* **combatView:** hook combat turn begin to properly capture focus player ([485edc1f](http://github.com/justindujardin/pow2/commit/485edc1f13cb522928d8c56e3907863aef47cef7))
* **mobile:** combat view loading on ios ([d0961bf0](http://github.com/justindujardin/pow2/commit/d0961bf05fea69badd3e96b30216cec116449ef1))
* **touch:**
  * leak in dismiss click handler for alert service ([7f2a5a74](http://github.com/justindujardin/pow2/commit/7f2a5a74972ef3ecfbfee5fe62178a0455de3507))
  * don't eat alert dismiss events ([1d4658bc](http://github.com/justindujardin/pow2/commit/1d4658bc9b453b0a09de602020c8eae49c0ac3fe))


#### Features

* support grunt release task ([26dc8c8e](http://github.com/justindujardin/pow2/commit/26dc8c8ebc7e8c5a78eaaac89ca5c19f3d3e1148))
* support grunt relese task ([a5bed914](http://github.com/justindujardin/pow2/commit/a5bed9142f1519f1c575051da4a4188aaf829d00))
* support multiple tile map layers and tile collision ([da8016f4](http://github.com/justindujardin/pow2/commit/da8016f4fa0d570d73687a6238762c0a35ddb9e6))
* support caching google spreadsheet data ([ac7dc807](http://github.com/justindujardin/pow2/commit/ac7dc80755b155cde6204e999f4fe5bde679131c))
* bring back analog touch input control ([36e74b91](http://github.com/justindujardin/pow2/commit/36e74b91d89bf2516eb6bf1356d6a21a88df7aa2))
* add close buttons to dialogs ([4da4e3b0](http://github.com/justindujardin/pow2/commit/4da4e3b009ef92d2bacf47d6c95066a0f7e65e57))
* load enemies data from google spreadsheet ([56baccd3](http://github.com/justindujardin/pow2/commit/56baccd3a4b899b91238626c634cdb5356e768fb))
* **api:** support module level game world get/set ([ed54ee71](http://github.com/justindujardin/pow2/commit/ed54ee712dc2c287b5a5948088dc718c3826b26d))
* **astar:** prefer tile types that are considered paths ([d37e7e67](http://github.com/justindujardin/pow2/commit/d37e7e676cd4178cea4db43f3b1cdfaaf36029d1))
* **combat:**
  * persist combat counter across all maps ([fac8836b](http://github.com/justindujardin/pow2/commit/fac8836b3a225324eaec90025fa73fc974a93ae7))
  * define combat encounter groups in spreadsheet ([c15140b5](http://github.com/justindujardin/pow2/commit/c15140b5d46f1de2207efc6e47dfbd7f62920f0f))
  * restrict enemies in combat to their specified groups ([4615094b](http://github.com/justindujardin/pow2/commit/4615094bd6034559c52b350a4896f0673e2aa927))
  * world zone specific combat maps ([b1c1a45b](http://github.com/justindujardin/pow2/commit/b1c1a45bda9fc71af481ebe3e3b831d8770755e2))
  * allow character class specific render components ([2a2be5cd](http://github.com/justindujardin/pow2/commit/2a2be5cdea84611ef9a0552c905667214bbf6a7f))
  * add support for magic attack animations ([6187a36a](http://github.com/justindujardin/pow2/commit/6187a36a41cf6147050322df77ccbbfd7f6ec3ed))
* **debugging:** add class name toString for scene classes ([bcb2ce12](http://github.com/justindujardin/pow2/commit/bcb2ce127c8ad1020172f8fc489a25ae112fd85c))
* **editorCanvas:** add prototype editorCanvas ([18abb711](http://github.com/justindujardin/pow2/commit/18abb711ad09e2db56453c94752f385c5015f7ca))
* **gameFeatureObject:** add category string to features ([ff9af5e6](http://github.com/justindujardin/pow2/commit/ff9af5e6ca003ed2e7e3a4b830b219cc66d58ebf))
* **karma:** set up testing config and skeleton ([4eb1f490](http://github.com/justindujardin/pow2/commit/4eb1f49048ea9fc1a9252296e791fc99105c050a))
* **sceneView:** make SceneView class derive SceneObject to allow it to have components ([38b18ef0](http://github.com/justindujardin/pow2/commit/38b18ef02323e7fb2753b56ac8fb8bb542aed7e7))
* **ship:** save ship position with game ([5bd0e925](http://github.com/justindujardin/pow2/commit/5bd0e9258e813263ba28a9f3451a9eb518601ae0))
* **sprites:** support writing sheet source info as json ([d701d668](http://github.com/justindujardin/pow2/commit/d701d66883c9427cf8ec5e7c697a7f771302536b))
* **storeView:** populate store inventory from google spreadsheet ([60f6f03d](http://github.com/justindujardin/pow2/commit/60f6f03ded9fd40aad94f28e146c61e841c75b5f))
* **tiled:** support inline tileset for tmx maps ([5eb9c035](http://github.com/justindujardin/pow2/commit/5eb9c03598e9de26c65fdb7d3f6531dea756d423))
* **treasure:**
  * support finding items in treasure features ([6c5faed9](http://github.com/justindujardin/pow2/commit/6c5faed9bcfe9d62007cbf57e7e95005fc26263d))
  * basic chest feature component that awards gold ([3fc281d2](http://github.com/justindujardin/pow2/commit/3fc281d258cb746b0670ee961f1d7433ccadd949))


