angular.module('templates-rpg', ['games/rpg/directives/bits/healthBar.html', 'games/rpg/directives/combatView.html', 'games/rpg/directives/dialogView.html', 'games/rpg/directives/gameMenu.html', 'games/rpg/directives/heroCard.html', 'games/rpg/directives/inventoryView.html', 'games/rpg/directives/pages/mainMenu.html', 'games/rpg/directives/storeView.html', 'games/rpg/directives/templeView.html', 'games/rpg/index.html']);

angular.module("games/rpg/directives/bits/healthBar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/rpg/directives/bits/healthBar.html",
    "<div class=\"progress\" ng-class=\"getProgressClass(model)\">\n" +
    "  <div class=\"progress-bar\" ng-style=\"getProgressBarStyle(model)\">\n" +
    "    <span class=\"sr-only\"></span>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("games/rpg/directives/combatView.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/rpg/directives/combatView.html",
    "<div class=\"combat-view\" ng-show=\"combat\">\n" +
    "\n" +
    "  <ul ng-if=\"combatCtrl.choosing\" class=\"ebp action-menu\">\n" +
    "    <li ng-repeat=\"action in combatCtrl.getActions()\" ng-click=\"selectAction(action)\">{{action.getActionName()}}</li>\n" +
    "  </ul>\n" +
    "  <ul ng-if=\"combatCtrl.choosingSpell\" class=\"ebp spells-menu\">\n" +
    "    <li ng-repeat=\"spell in combatCtrl.getSpells()\" ng-click=\"selectSpell(spell)\">{{spell.name}}</li>\n" +
    "  </ul>\n" +
    "  <ul ng-if=\"combatCtrl.targeting\" class=\"ebp targets-menu\">\n" +
    "    <li ng-repeat=\"target in combatCtrl.getTargets()\" ng-click=\"selectTarget(target)\">{{target.model.attributes.name}}\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "  <div class=\"status\" ng-repeat=\"member in combat.party\" ng-class=\"combatCtrl.getMemberClass(member,combat.focus)\">\n" +
    "    <span class=\"name\">{{member.model.attributes.name}}</span>\n" +
    "    <span class=\"hp\">HP {{member.model.attributes.hp}} / {{member.model.attributes.maxHP}}</span>\n" +
    "    <health-bar model=\"member.model\"></health-bar>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("games/rpg/directives/dialogView.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/rpg/directives/dialogView.html",
    "<div class=\"row dialog-view\">\n" +
    "  <div class=\"col-xs-12\">\n" +
    "    <div class=\"dialog ebp\" ng-show=\"dialog\">\n" +
    "      <button class=\"btn-close btn btn-flap\" ng-click=\"dialog=null\"><i class=\"glyphicon glyphicon-remove\"></i></button>\n" +
    "      <div class=\"container\">\n" +
    "        <div class=\"row\">\n" +
    "          <div class=\"col-xs-2 character\">\n" +
    "            <div icon-render icon=\"dialog.icon\"></div>\n" +
    "          </div>\n" +
    "          <div class=\"col-xs-10\">\n" +
    "            <p>{{dialog.title}}</p>\n" +
    "            <span class=\"text\">{{dialog.text}}</span>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("games/rpg/directives/gameMenu.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/rpg/directives/gameMenu.html",
    "<div class=\"game-menu\" ng-hide=\"combat\">\n" +
    "  <a href=\"#\" class=\"trigger glyphicon glyphicon-collapse-down\" ng-click=\"toggle()\" ng-hide=\"open\"></a>\n" +
    "\n" +
    "  <div class=\"navigation\" ng-show=\"open\">\n" +
    "    <ul class=\"options\">\n" +
    "      <!-- Close -->\n" +
    "      <li><a href=\"#\" ng-click=\"toggle()\"><span class=\"glyphicon glyphicon glyphicon-collapse-up\"></span></a></li>\n" +
    "      <!-- Characters -->\n" +
    "      <li ng-class=\"{active:page=='party'}\">\n" +
    "        <a href=\"#\" ng-click=\"showParty()\"><span class=\"pow2-black-flag\"></span></a>\n" +
    "      </li>\n" +
    "      <!-- Inventory/Equipment -->\n" +
    "      <li ng-class=\"{active:page=='inventory'}\">\n" +
    "        <a href=\"#\" ng-click=\"showInventory()\"><span class=\"pow2-battle-gear\"></span></a>\n" +
    "      </li>\n" +
    "      <!-- Save/Reset -->\n" +
    "      <li ng-class=\"{active:page=='save'}\">\n" +
    "        <a href=\"#\" ng-click=\"showSave()\"><span class=\"glyphicon glyphicon-floppy-disk\"></span></a>\n" +
    "      </li>\n" +
    "\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "  <div class=\"views\" ng-if=\"open\" ng-show=\"open\" ng-class=\"{open:open}\">\n" +
    "    <div class=\"party\" ng-if=\"page == 'party'\">\n" +
    "      <div class=\"\">\n" +
    "        <h1>Party Gold: {{gameModel.gold}}</h1>\n" +
    "      </div>\n" +
    "      <hero-card hero=\"member\" ng-repeat=\"member in party\"></hero-card>\n" +
    "    </div>\n" +
    "    <div class=\"inventory\" ng-if=\"page == 'inventory'\">\n" +
    "      <inventory-view></inventory-view>\n" +
    "    </div>\n" +
    "    <div class=\"save\" ng-if=\"page == 'save'\">\n" +
    "      <button class=\"btn btn-flat\" ng-click=\"saveGame()\"><i class=\"glyphicon glyphicon-floppy-disk\"></i> Save Game\n" +
    "      </button>\n" +
    "      <button class=\"btn btn-flat\" ng-click=\"resetGame()\"><i class=\"glyphicon glyphicon-floppy-remove\"></i> Reset Game\n" +
    "      </button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("games/rpg/directives/heroCard.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/rpg/directives/heroCard.html",
    "<div class=\"hero-card\" ng-class=\"{dead:hero.attributes.hp <= 0}\">\n" +
    "  <h3 class=\"name\">{{hero.attributes.name}}</h3>\n" +
    "\n" +
    "  <div class=\"image\" icon-render icon=\"hero.attributes.icon\" frame=\"7\" width=\"64\" height=\"72\"></div>\n" +
    "  <div>Level {{hero.attributes.level}}</div>\n" +
    "  <div>HP {{hero.attributes.hp}} / {{hero.attributes.maxHP}}</div>\n" +
    "  <health-bar model=\"hero\"></health-bar>\n" +
    "  <div>EXP {{hero.attributes.exp}} / {{hero.attributes.nextLevelExp}}</div>\n" +
    "  <div class=\"progress\">\n" +
    "    <div class=\"progress-bar\"\n" +
    "         style=\"width:{{(hero.attributes.exp - hero.attributes.prevLevelExp) / (hero.attributes.nextLevelExp - hero.attributes.prevLevelExp) * 100 }}%;\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"hero-stat\">Strength : {{hero.attributes.strength}}</div>\n" +
    "  <div class=\"hero-stat\">Agility : {{hero.attributes.agility}}</div>\n" +
    "  <div class=\"hero-stat\">Vitality : {{hero.attributes.vitality}}</div>\n" +
    "  <div class=\"hero-stat\">Intelligence : {{hero.attributes.intelligence}}</div>\n" +
    "  <hr/>\n" +
    "  <div class=\"hero-stat\">Damage : {{hero.getDamage()}}</div>\n" +
    "  <div class=\"hero-stat\">Defense : {{hero.getDefense()}}</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("games/rpg/directives/inventoryView.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/rpg/directives/inventoryView.html",
    "<div class=\"container\">\n" +
    "  <button class=\"btn btn-flat previous\" ng-click=\"previousCharacter()\"><span\n" +
    "      class=\"glyphicon glyphicon-chevron-left\"></span></button>\n" +
    "  <button class=\"btn btn-flat next\" ng-click=\"nextCharacter()\"><span class=\"glyphicon glyphicon-chevron-right\"></span>\n" +
    "  </button>\n" +
    "  <h2>{{character.attributes.name}} <i class=\"image\" icon-render icon=\"character.attributes.icon\" frame=\"7\"></i></h2>\n" +
    "\n" +
    "  <div class=\"hero-stat\">Damage : {{character.getDamage()}}</div>\n" +
    "  <div class=\"hero-stat\">Defense : {{character.getDefense()}}</div>\n" +
    "\n" +
    "  <ul class=\"equipped\">\n" +
    "    <li class=\"weapon\">\n" +
    "      <span class=\"desc\">Weapon</span>\n" +
    "      <i class=\"icon\" icon-render icon=\"character.weapon.attributes.icon\" ng-click=\"unequipItem(character.weapon)\"></i>\n" +
    "    </li>\n" +
    "    <li class=\"jewelry\">\n" +
    "      <span class=\"desc\">Accessory</span>\n" +
    "      <i class=\"icon\" icon-render icon=\"character.accessory.attributes.icon\"\n" +
    "         ng-click=\"unequipItem(character.accessory)\"></i>\n" +
    "    </li>\n" +
    "    <li class=\"head\">\n" +
    "      <span class=\"desc\">Head</span>\n" +
    "      <i class=\"icon\" icon-render icon=\"character.head.attributes.icon\" ng-click=\"unequipItem(character.head)\"></i>\n" +
    "    </li>\n" +
    "    <li class=\"body\">\n" +
    "      <span class=\"desc\">Body</span>\n" +
    "      <i class=\"icon\" icon-render icon=\"character.body.attributes.icon\" ng-click=\"unequipItem(character.body)\"></i>\n" +
    "    </li>\n" +
    "    <li class=\"arms\">\n" +
    "      <span class=\"desc\">Arms</span>\n" +
    "      <i class=\"icon\" icon-render icon=\"character.arms.attributes.icon\" ng-click=\"unequipItem(character.arms)\"></i>\n" +
    "    </li>\n" +
    "    <li class=\"feet\">\n" +
    "      <span class=\"desc\">Feet</span>\n" +
    "      <i class=\"icon\" icon-render icon=\"character.feet.attributes.icon\" ng-click=\"unequipItem(character.feet)\"></i>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"container\">\n" +
    "  <h1>Inventory</h1>\n" +
    "  <ul class=\"unequipped\" ng-init=\"setPartyMember=false\">\n" +
    "    <li class=\"item\" ng-repeat=\"item in inventory track by $index\" ng-click=\"equipItem(item)\">\n" +
    "      <span class=\"desc\">{{item.attributes.name}}</span>\n" +
    "      <i class=\"icon\" icon-render icon=\"item.attributes.icon\"></i>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n" +
    "");
}]);

angular.module("games/rpg/directives/pages/mainMenu.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/rpg/directives/pages/mainMenu.html",
    "<h1>Pow2!</h1>\n" +
    "<p>Choose a character</p>\n" +
    "<button class=\"previous btn btn-link\" ng-click=\"mainMenu.previousClass()\"><i\n" +
    "    class=\"glyphicon glyphicon-chevron-left\"></i></button>\n" +
    "<button class=\"next btn btn-link\" ng-click=\"mainMenu.nextClass()\"><i class=\"glyphicon glyphicon-chevron-right\"></i>\n" +
    "</button>\n" +
    "<ul ng-click=\"mainMenu.nextClass()\" ng-swipe-left=\"mainMenu.previousClass()\" ng-swipe-left=\"mainMenu.nextClass()\">\n" +
    "  <li ng-repeat=\"class in classes\" ng-class=\"mainMenu.getItemClass(class)\">\n" +
    "    <h3>{{class.name}}</h3>\n" +
    "    <i icon-render icon=\"mainMenu.getClassIcon(class)\" width=\"128\" height=\"128\" frame=\"7\"></i>\n" +
    "  </li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("games/rpg/directives/storeView.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/rpg/directives/storeView.html",
    "<div class=\"store-view ebp\" ng-if=\"store\">\n" +
    "  <div class=\"header\">\n" +
    "    <div class=\"title\">\n" +
    "      <div class=\"name\">\n" +
    "        <h1>{{storeCtrl.getActionVerb()}} {{store.name}}</h1> <span>Gold: {{gameModel.gold}}</span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"inventory\">\n" +
    "    <ul ng-if=\"storeCtrl.isBuying()\">\n" +
    "      <li class=\"item\" ng-repeat=\"item in store.inventory\" ng-click=\"storeCtrl.selectItem(item)\">\n" +
    "            <span class=\"icon\" icon-render icon=\"item.icon\">\n" +
    "            </span>\n" +
    "        <span class=\"item-name\">{{item.name}}</span>\n" +
    "        <span class=\"item-price\">{{item.cost}}</span>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "    <ul ng-if=\"storeCtrl.isSelling()\">\n" +
    "      <li class=\"item\" ng-repeat=\"item in storeCtrl.gameModel.inventory\" ng-click=\"storeCtrl.selectItem(item)\">\n" +
    "            <span class=\"icon\" icon-render icon=\"item.attributes.icon\">\n" +
    "            </span>\n" +
    "        <span class=\"item-name\">{{item.attributes.name}}</span>\n" +
    "        <span class=\"item-price\">{{item.attributes.cost}}</span>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <ul ng-if=\"storeCtrl.selected\">\n" +
    "      <li class=\"item selected\">\n" +
    "            <span class=\"icon\" icon-render icon=\"storeCtrl.selected.icon\">\n" +
    "            </span>\n" +
    "        <span class=\"item-name\">{{storeCtrl.selected.name}}</span>\n" +
    "        <span class=\"item-price\">{{storeCtrl.selected.cost}}</span>\n" +
    "      </li>\n" +
    "      <div class=\"prompt btn-group\">\n" +
    "        <button class=\"btn btn-flat\" ng-click=\"storeCtrl.selected=null\">Back</button>\n" +
    "        <button class=\"btn btn-flat\" ng-click=\"storeCtrl.actionItem(storeCtrl.selected)\">\n" +
    "          {{storeCtrl.selling?\"Sell\":\"Buy\"}}\n" +
    "        </button>\n" +
    "      </div>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"prompt btn-group\" ng-if=\"!storeCtrl.selected\">\n" +
    "    <button class=\"btn btn-flat\" ng-click=\"storeCtrl.destroy()\">Done</button>\n" +
    "    <button class=\"btn btn-flat\" ng-click=\"storeCtrl.toggleAction()\">{{storeCtrl.selling?\"Buy\":\"Sell\"}}</button>\n" +
    "  </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("games/rpg/directives/templeView.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/rpg/directives/templeView.html",
    "<div class=\"temple-view ebp\">\n" +
    "  <div class=\"header\">\n" +
    "    <span icon-render icon=\"temple.icon\"></span>\n" +
    "\n" +
    "    <h1>{{temple.name}}</h1>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"prompt\">\n" +
    "    <h2>It will cost you {{temple.cost}} of your {{gameModel.gold}} monies to heal here.</h2>\n" +
    "\n" +
    "    <p>Would you like to heal your party members?</p>\n" +
    "    <button class=\"btn btn-flat\" ng-click=\"heal()\">Yes</button>\n" +
    "    <button class=\"btn btn-flat\" ng-click=\"cancel()\">No</button>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"party\">\n" +
    "    <div class=\"member\" ng-repeat=\"hero in party\">\n" +
    "      <div class=\"image\" icon-render icon=\"hero.attributes.icon\" frame=\"7\"></div>\n" +
    "      <h1 class=\"name\">{{hero.attributes.name}}</h1>\n" +
    "\n" +
    "      <div class=\"stats\">\n" +
    "        <div>Level {{hero.attributes.level}}</div>\n" +
    "        <div>HP {{hero.attributes.hp}} / {{hero.attributes.maxHP}}</div>\n" +
    "      </div>\n" +
    "      <health-bar model=\"hero\"></health-bar>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("games/rpg/index.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/rpg/index.html",
    "<!-- Pow2 -->\n" +
    "<!doctype html>\n" +
    "<html ng-app=\"rpg\">\n" +
    "<head>\n" +
    "  <title>Pow2 - Develop</title>\n" +
    "\n" +
    "  <meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\"/>\n" +
    "  <meta http-equiv=\"Content-Style-Type\" content=\"text/css\"/>\n" +
    "  <meta http-equiv=\"Content-Script-Type\" content=\"text/javascript\"/>\n" +
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0\">\n" +
    "  <style type=\"text/css\">\n" +
    "    .ng-hide {\n" +
    "      display: none !important;\n" +
    "    }\n" +
    "  </style>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"/css/rpg.css\" media=\"all\"/>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"/css/pow2.ui.css\" media=\"all\"/>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"/fonts/pow2.css\" media=\"all\"/>\n" +
    "</head>\n" +
    "<body ng-controller=\"RPGGameController\">\n" +
    "\n" +
    "<game-menu class=\"ng-hide\" ng-show=\"loaded\"></game-menu>\n" +
    "\n" +
    "<div class=\"loading fade pt-page-scaleUp\" ng-show=\"loading\">\n" +
    "  <div class=\"loading-wrapper\">\n" +
    "    <div class=\"loading-wrapper-inner\">\n" +
    "      <div class=\"hero-container\">\n" +
    "        <h1 ng-bind=\"loadingTitle\">Pow2!</h1>\n" +
    "\n" +
    "        <p ng-bind=\"loadingMessage\">Waking up...</p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<main-menu class=\"fade ng-hide\" ng-show=\"menu\"></main-menu>\n" +
    "\n" +
    "\n" +
    "<div class=\"game-container fade\" ng-if=\"loaded\" id=\"alertContainer\">\n" +
    "  <canvas class=\"game-view map fade\" width=\"960\" height=\"640\" game-canvas ng-hide=\"inCombat\">\n" +
    "    Your browser doesn't support this.\n" +
    "  </canvas>\n" +
    "  <canvas class=\"game-view combat fade\" width=\"960\" height=\"640\" combat-canvas ng-hide=\"!inCombat\">\n" +
    "    Your browser doesn't support this.\n" +
    "  </canvas>\n" +
    "  <combat-view ng-if=\"inCombat\"></combat-view>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"ui-container container ng-hide fade\" ng-show=\"loaded\">\n" +
    "  <dialog-view ng-show=\"dialog\"></dialog-view>\n" +
    "  <store-view ng-show=\"store\"></store-view>\n" +
    "  <temple-view ng-show=\"temple\"></temple-view>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<!-- Compiled Game Files -->\n" +
    "<script type=\"text/javascript\" src=\"/bower/jquery/jquery.min.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/underscore/underscore-min.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/backbone/backbone.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/angular/angular.min.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/angular-animate/angular-animate.min.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/angular-sanitize/angular-sanitize.min.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/angular-touch/angular-touch.min.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/astar/astar.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/tabletop/src/tabletop.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/pow-core/lib/pow-core.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/lib/pow2.js\"></script>\n" +
    "<script type=\"text/javascript\">\n" +
    "//  pow2.GAME_ROOT = 'https://cdn.rawgit.com/justindujardin/pow2/v0.1.1/';\n" +
    "</script>\n" +
    "<script type=\"text/javascript\" src=\"/lib/pow2.rpg.templates.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/lib/pow2.rpg.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/lib/pow2.ui.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/lib/pow2.sprites.js\"></script>\n" +
    "\n" +
    "</body>\n" +
    "</html>");
}]);
