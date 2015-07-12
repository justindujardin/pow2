<a name="0.1.6"></a>
### 0.1.6 (2015-07-12)


#### Bug Fixes

* **bower:** remove unused bloated angular dependencies ([83469104](http://github.com/justindujardin/pow2/commit/834691043d7ecf421f11ceaf3dfbd0cafdad5905))


<a name="0.1.5"></a>
### 0.1.5 (2015-07-12)


#### Bug Fixes

* issue where sprite render would assume absolute url path for images ([e721b347](http://github.com/justindujardin/pow2/commit/e721b347c41af000d6858560f9bf37c2c4d391e5))
* issue where pow2.d.ts was incompatible with pow-core.d.ts outside of this repo ([43daa530](http://github.com/justindujardin/pow2/commit/43daa530593fb9909af703fcc31f9e7e4f821de9))


<a name="0.1.4"></a>
### 0.1.4 (2015-06-13)


#### Features

* publish bower package ([1d609c9f](http://github.com/justindujardin/pow2/commit/1d609c9f7045a4dabf848deecf0fd1978836353f))


<a name="0.1.3"></a>
### 0.1.3 (2015-05-25)


<a name="0.1.2"></a>
### 0.1.2 (2015-05-25)


#### Bug Fixes

* one-hit-kill on enemies ([413ceffb](http://github.com/justindujardin/pow2/commit/413ceffb3c3b5a02e2921a6a55ab8d3f944a79c7))


#### Features

* support loading game assets from arbitrary root path ([c8c09f6d](http://github.com/justindujardin/pow2/commit/c8c09f6d1cabf0b4f5f08c16c5fd27aa6d1db08a))


<a name="0.1.1"></a>
### 0.1.1 (2015-04-26)


<a name="0.1.0"></a>
## 0.1.0 (2015-04-26)


#### Bug Fixes

* combat lockup and menu alerts ([d7a3c0bf](http://github.com/justindujardin/pow2/commit/d7a3c0bf14db1fecb48656492305761363766a24))
* make health bar directive more resilient ([6faf9e46](http://github.com/justindujardin/pow2/commit/6faf9e46146f5bd583cfcdb55557456981aab526))
* **$powAlert:** race conditions and exception handling for callbacks ([c55c18dd](http://github.com/justindujardin/pow2/commit/c55c18dd05098b7789396bd4f23e5ba17a44551d))
* **Combat:** running from fixed encounter does not defeat it ([c5722840](http://github.com/justindujardin/pow2/commit/c5722840c8194dc1ea62702bc578332ab9f69132))
* **CombatEncounterComponent:** fix issue with map combat detection ([097d889a](http://github.com/justindujardin/pow2/commit/097d889ad34f36310a8d959403a028d8a4bd8e65))
* **CombatView:** issue where touch events generate two clicks ([625617b2](http://github.com/justindujardin/pow2/commit/625617b216ce283ea4bb5901a6b3cc5fbcd6e847))
* **ShipFeatureComponent:** issue where ship could not be boarded ([e28041c7](http://github.com/justindujardin/pow2/commit/e28041c70299592985ba04164282f4ee0a32c6d9))
* **TileComponent:** fix trigger event notifications ([2a966b8c](http://github.com/justindujardin/pow2/commit/2a966b8ca4f7e2267afe1e0c7f8c0c4354cf59ae))
* **combatHudController:** never allow escaping from turn order dialog ([73c9e467](http://github.com/justindujardin/pow2/commit/73c9e4672b5d000ce55b32bdfe327f25dafa71d8))
* **dorkapon:** always show left and right fighters in combat ([42995341](http://github.com/justindujardin/pow2/commit/42995341c0634b520071df7d458b603a16d37246))
* **playerRenderComponent:** set heading even if not animating ([bbb7b7fe](http://github.com/justindujardin/pow2/commit/bbb7b7fec244d439e5c612ef0f30207a73f01eb1))


#### Features

* add basic documentation site generation ([307bd1ec](http://github.com/justindujardin/pow2/commit/307bd1ecc1587c2970c0d2c2aa408f720b149f63))
* generate documentation on heroku app ([e87c1c14](http://github.com/justindujardin/pow2/commit/e87c1c1444f62dbe39a210821466447d568e33d4))
* support weapon and armor stats in battle ([e5eb9325](http://github.com/justindujardin/pow2/commit/e5eb9325bfb89a62e4284ac02dcad8e957cc1c89))
* support weapon and armor nodes in map ([aa8e4106](http://github.com/justindujardin/pow2/commit/aa8e41063e371660415b1021f79fbf2d786c3af1))
* add SceneViewComponent for view decoration ([511cd326](http://github.com/justindujardin/pow2/commit/511cd3269abaf69efa791746d9d3d3386d77992f))
* add basic combat hud with character stats ([46819bd5](http://github.com/justindujardin/pow2/commit/46819bd5b665b8d87b7ee47723dbc957d856d469))
* add specific monster and player models ([c18517e2](http://github.com/justindujardin/pow2/commit/c18517e24d5e59bbd344234d80b72d20126a7e5b))
* build dorkapon ui in angular material system ([849bff47](http://github.com/justindujardin/pow2/commit/849bff4713b1f4e4e8f8a6e19c0449b55a6a8091))
* pick turn order on combat start ([aa187a45](http://github.com/justindujardin/pow2/commit/aa187a45a2209d21ace13b8ea8468ccf4dfecb0f))
* fight a random monster on empty tiles ([c6eaa855](http://github.com/justindujardin/pow2/commit/c6eaa855ec4a4e153270b7e0472372019c0b4f0a))
* support transitioning to and from combat on empty tiles ([16c77867](http://github.com/justindujardin/pow2/commit/16c7786758be1a590f9bd43acc16d9c6a72a18ee))
* add application state machine and load map state at startup ([753ef0f7](http://github.com/justindujardin/pow2/commit/753ef0f75c1f0274c9b604cccd483438ccabd850))
* dorkapon combat state machine ([90b696c8](http://github.com/justindujardin/pow2/commit/90b696c884476502ab3e0b75c805709415d79580))
* dorkaponEntity object and model for compositions ([1d850e7e](http://github.com/justindujardin/pow2/commit/1d850e7e49203a379c3ca446722b03a11f7c50a7))
* add map node component ([82880e8a](http://github.com/justindujardin/pow2/commit/82880e8a6dd860547f43f7cee317f83891023f87))
* camera that tracks active player on map ([2e6beab4](http://github.com/justindujardin/pow2/commit/2e6beab49b77b3a372b8478c4b6aabe7a8f800cc))
* allow entity creation from template files ([a30fda09](http://github.com/justindujardin/pow2/commit/a30fda097088226c2c480b3a1a90f08e78da55a6))
* **Combat:**
  * basic hurt and heal magic ([2fb33e2b](http://github.com/justindujardin/pow2/commit/2fb33e2b5c550832b9490f877b42853166a3459f))
  * support an arbitrary number of actions ([84ae36c0](http://github.com/justindujardin/pow2/commit/84ae36c09456f571622a5913e4d75bedc434273b))
  * scaffolding combat action components ([50dce17e](http://github.com/justindujardin/pow2/commit/50dce17e3b0692aabc1f83238f79b0c73510efe5))
  * choose all player moves up front ([a82bbccf](http://github.com/justindujardin/pow2/commit/a82bbccf7bb828f73d5df70293fabc9c52bb97f4))
* **CombatView:**
  * target selection from menu items ([92c1ec52](http://github.com/justindujardin/pow2/commit/92c1ec52e92df8b2ad3f52207f21fa6369e1d5ef))
  * combat action chooser ui states ([0dd7412a](http://github.com/justindujardin/pow2/commit/0dd7412a7384d6ff5529796f5d1bbd04a38249d8))
* **Dorkapon:**
  * player camera and node clicking ([da55f0d3](http://github.com/justindujardin/pow2/commit/da55f0d36b312f36447478265f6d9f42857c56fb))
  * map with path movement prototype ([0ec7e856](http://github.com/justindujardin/pow2/commit/0ec7e8563d87c75e162d9a455d194fc690a83f2a))
* **DorkaponHud:** add basic player HUD ([fb2c254a](http://github.com/justindujardin/pow2/commit/fb2c254a0bfef2f550ec5291ce90d0232e3880e2))
* **DorkaponMap:** scale canvas for smaller viewports ([85455902](http://github.com/justindujardin/pow2/commit/85455902392e7b28a45f30f69780907c1de53bfc))
* **DorkaponTileMap:** node features with enter exit events ([085aa3e9](http://github.com/justindujardin/pow2/commit/085aa3e9d010a1c3c1e92f8afa139e9ff0645c29))
* **EntityContainer:** support user specified object constructor args ([66b0cb63](http://github.com/justindujardin/pow2/commit/66b0cb634d2c2bc93ba839762bdb506cd050306d))
* **GameMapView:** allow path target outline render customization ([6d46f399](http://github.com/justindujardin/pow2/commit/6d46f39951a4cbb72dbc874fae5a4f18b7bebc84))
* **PlayerComponent:** add collideWithMap method ([496c141d](http://github.com/justindujardin/pow2/commit/496c141d9a65779162e527095be578651e7c05a1))
* **PlayerTurnComponent:** scaffolding for moves and node components ([4d31ced3](http://github.com/justindujardin/pow2/commit/4d31ced3b92bf99e4998234473e55c853ef87bb1))
* **StateMachine:**
  * support multiple async notify callbacks ([b08784b2](http://github.com/justindujardin/pow2/commit/b08784b256d459125e268cb36fab49fb02e0c958))
  * unwind the callstack before changing states ([d1b48959](http://github.com/justindujardin/pow2/commit/d1b48959f935730f56e2fc421f62b710f3de9639))
* **StoreView:** support buying and selling inventory ([0135a090](http://github.com/justindujardin/pow2/commit/0135a09012f816b409921cb240a36d998050eb52))
* **combat:**
  * add magic action instead of attack for magic users ([730cdbe4](http://github.com/justindujardin/pow2/commit/730cdbe44ee0d179d57101b28342bd54cb3168dc))
  * add guard action in combat to buff defense ([6c4ecce3](http://github.com/justindujardin/pow2/commit/6c4ecce30ae32c31aa5aa8d03d253b1902166dca))
* **docs:** enumerate pow entities and list them in documentation ([a2f8e6fc](http://github.com/justindujardin/pow2/commit/a2f8e6fc69d96365fe2f137ed8ffd73680a7be84))
* **dorkapon:** clear game data cache when ?dev is on the url ([81120e67](http://github.com/justindujardin/pow2/commit/81120e671ad3f08de94887c59d0adc4586cfa65f))
* **dorkaponCombat:**
  * real interactive combat simulation ([74d0d26a](http://github.com/justindujardin/pow2/commit/74d0d26acc7b9aae44f08da519ec9080426c2cde))
  * basic animations for fighters ([f4b1a0b8](http://github.com/justindujardin/pow2/commit/f4b1a0b8129fe308b7dcd87f9fd231499dbc3249))
* **gameMapPlayer:** add path component for touch movement ([b17e6f32](http://github.com/justindujardin/pow2/commit/b17e6f32cdf6c4f9b3f68a369d6e704b603a0e24))
* **grunt:** add typedoc generation support ([64847edf](http://github.com/justindujardin/pow2/commit/64847edf54197e7b023c6feb708f0d579d7c761e))
* **playerCombatRenderComponent:** attack to the left and right ([22576863](http://github.com/justindujardin/pow2/commit/2257686368dbade5e79449da986af6788483c6ae))
* **release:** version generated sprite sheets artifacts ([13911d25](http://github.com/justindujardin/pow2/commit/13911d2547490fb27bca873f8abe809edc3f1441))


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


