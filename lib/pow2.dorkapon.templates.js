angular.module('templates-dorkapon', ['games/dorkapon/controllers/characterCard.html', 'games/dorkapon/dialogs/combatChooseMove.html', 'games/dorkapon/dialogs/combatTurnOrder.html', 'games/dorkapon/index.html']);

angular.module("games/dorkapon/controllers/characterCard.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/dorkapon/controllers/characterCard.html",
    "<md-dialog aria-label=\"Character Details\">\n" +
    "  <md-content layout=\"column\" layout-align=\"center center\">\n" +
    "    <i class=\"image\" icon-render icon=\"character.model.attributes.icon\" frame=\"7\" width=\"48\" height=\"48\"></i>\n" +
    "\n" +
    "    <h3>{{character.model.attributes.name}}</h3>\n" +
    "\n" +
    "    <h3>Weapon: <i class=\"image\" icon-render icon=\"character.model.attributes.weapon.icon\" width=\"48\" height=\"48\"></i>\n" +
    "    </h3>\n" +
    "\n" +
    "    <h3>Armor: <i class=\"image\" icon-render icon=\"character.model.attributes.armor.icon\" width=\"48\" height=\"48\"></i>\n" +
    "    </h3>\n" +
    "  </md-content>\n" +
    "</md-dialog>\n" +
    "");
}]);

angular.module("games/dorkapon/dialogs/combatChooseMove.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/dorkapon/dialogs/combatChooseMove.html",
    "<md-dialog aria-label=\"Choose Player Move\">\n" +
    "  <md-content class=\"choose-move\" layout=\"column\" layout-align=\"center center\">\n" +
    "    <i class=\"image\" icon-render icon=\"choose.current.model.attributes.icon\" frame=\"7\" width=\"48\" height=\"48\"></i>\n" +
    "\n" +
    "    <h3>Choose Move</h3>\n" +
    "\n" +
    "    <div layout-fill layout layout-align=\"center center\">\n" +
    "      <md-button class=\"md-primary\" ng-click=\"choose.select('physical')\">{{choose.physicalText}}</md-button>\n" +
    "    </div>\n" +
    "    <div layout-fill layout=\"row\" layout-align=\"space-between center\">\n" +
    "      <md-button class=\"md-primary\" ng-click=\"choose.select('magic')\">{{choose.magicText}}</md-button>\n" +
    "      <md-button class=\"md-primary\" ng-click=\"choose.select('special')\">{{choose.specialText}}</md-button>\n" +
    "    </div>\n" +
    "    <div layout-fill layout layout-align=\"center center\">\n" +
    "      <md-button class=\"md-primary\" ng-click=\"choose.select('skill')\">{{choose.skillText}}</md-button>\n" +
    "    </div>\n" +
    "  </md-content>\n" +
    "</md-dialog>\n" +
    "");
}]);

angular.module("games/dorkapon/dialogs/combatTurnOrder.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/dorkapon/dialogs/combatTurnOrder.html",
    "<md-dialog aria-label=\"Determine Turn Order\">\n" +
    "  <md-content>\n" +
    "    <h1 ng-show=\"combat.pick\">Choose A Card</h1>\n" +
    "\n" +
    "    <h1 ng-show=\"!combat.pick\">You Attack {{combat.pickCorrect ? \"First\" : \"Second\"}}</h1>\n" +
    "  </md-content>\n" +
    "  <div class=\"md-actions\" layout=\"row\">\n" +
    "    <md-button flex=\"50\" ng-class=\"{picked:pickedLeft,picking:combat.pick}\"\n" +
    "               ng-click=\"combat.pick(true);pickedLeft=true\">\n" +
    "      <h1>{{combat.leftText}}</h1>\n" +
    "    </md-button>\n" +
    "    <span flex></span>\n" +
    "    <md-button flex=\"50\" ng-class=\"{picked:pickedRight,picking:combat.pick}\"\n" +
    "               ng-click=\"combat.pick(false);pickedRight=true\">\n" +
    "      <h1>{{combat.rightText}}</h1>\n" +
    "    </md-button>\n" +
    "  </div>\n" +
    "</md-dialog>\n" +
    "");
}]);

angular.module("games/dorkapon/index.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("games/dorkapon/index.html",
    "<!-- Pow2 -->\n" +
    "<!doctype html>\n" +
    "<html ng-app=\"dorkapon\">\n" +
    "<head>\n" +
    "  <title>Pow2 - Dorkapon</title>\n" +
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
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"/css/dorkapon.css\" media=\"all\"/>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"/css/pow2.ui.css\" media=\"all\"/>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"/bower/angular-material/angular-material.css\" media=\"all\"/>\n" +
    "</head>\n" +
    "<body ng-controller=\"DorkaponGameController\">\n" +
    "<div class=\"loading fade pt-page-scaleUp\" ng-show=\"loading\">\n" +
    "  <div class=\"loading-wrapper\">\n" +
    "    <div class=\"loading-wrapper-inner\">\n" +
    "      <div class=\"hero-container\">\n" +
    "        <h1 ng-bind=\"loadingTitle\">Dorkapon</h1>\n" +
    "\n" +
    "        <p ng-bind=\"loadingMessage\">Waking up...</p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div layout=\"column\" layout-fill ng-if=\"loaded\" class=\"ng-cloak\">\n" +
    "  <section layout=\"row\" flex>\n" +
    "    <div layout=\"column\" layout-fill>\n" +
    "      <!-- Map HUD -->\n" +
    "      <md-toolbar ng-controller=\"MapHudController as hud\" layout=\"row\" ng-show=\"!inCombat\">\n" +
    "        <h3 class=\"md-toolbar-tools\">\n" +
    "          <i class=\"image\" icon-render\n" +
    "             icon=\"hud.turn.player.model.attributes.icon\"\n" +
    "             frame=\"7\" width=\"48\" height=\"48\"\n" +
    "             ng-click=\"hud.showPlayerCard(hud.turn.player)\"></i>\n" +
    "          <span>{{hud.turn.player.model.attributes.name}}</span>\n" +
    "          <span flex></span>\n" +
    "          <span>{{hud.turn.player.model.attributes.moves}} Moves Left</span>\n" +
    "        </h3>\n" +
    "      </md-toolbar>\n" +
    "      <!-- Combat HUD -->\n" +
    "      <md-toolbar ng-controller=\"CombatHudController as hud\" layout=\"row\" ng-show=\"inCombat\">\n" +
    "        <h3 class=\"md-toolbar-tools\">\n" +
    "          <i class=\"image\" icon-render icon=\"hud.combat.left.model.attributes.icon\" frame=\"7\" width=\"48\"\n" +
    "             height=\"48\"></i>\n" +
    "\n" +
    "          <div layout=\"column\" flex=\"30\">\n" +
    "            <span>{{hud.combat.left.model.attributes.level}} {{hud.combat.left.model.attributes.name}}</span>\n" +
    "            <md-progress-linear class=\"md-accent\" md-mode=\"determinate\"\n" +
    "                                value=\"{{hud.getHitPointValue(hud.combat.left)}}\"></md-progress-linear>\n" +
    "          </div>\n" +
    "          <span flex></span>\n" +
    "\n" +
    "          <div layout=\"column\" flex=\"30\">\n" +
    "            <span>{{hud.combat.right.model.attributes.level}} {{hud.combat.right.model.attributes.name}}</span>\n" +
    "            <md-progress-linear class=\"md-accent\" md-mode=\"determinate\"\n" +
    "                                value=\"{{hud.getHitPointValue(hud.combat.right)}}\"></md-progress-linear>\n" +
    "          </div>\n" +
    "          <i class=\"image\" icon-render icon=\"hud.combat.right.model.attributes.icon\" frame=\"7\" width=\"48\"\n" +
    "             height=\"48\"></i>\n" +
    "        </h3>\n" +
    "      </md-toolbar>\n" +
    "      <div class=\"canvas-area\" flex layout=\"row\" layout-align=\"center center\">\n" +
    "        <canvas width=\"800\" height=\"600\" dorkapon-map>\n" +
    "          Your browser doesn't support this.\n" +
    "        </canvas>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </section>\n" +
    "</div>\n" +
    "\n" +
    "<!-- Compiled Game Files -->\n" +
    "<script type=\"text/javascript\" src=\"/bower/jquery/jquery.min.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/underscore/underscore-min.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/backbone/backbone.js\"></script>\n" +
    "\n" +
    "<script src=\"/bower/angular/angular.js\"></script>\n" +
    "<script src=\"/bower/angular-aria/angular-aria.js\"></script>\n" +
    "<script src=\"/bower/angular-animate/angular-animate.js\"></script>\n" +
    "<script src=\"/bower/angular-material/angular-material.js\"></script>\n" +
    "\n" +
    "<script type=\"text/javascript\" src=\"/bower/astar/astar.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/tabletop/src/tabletop.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/bower/pow-core/lib/pow-core.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/lib/pow2.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/lib/pow2.ui.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/lib/pow2.sprites.js\"></script>\n" +
    "<script type=\"text/javascript\" src=\"/lib/pow2.dorkapon.js\"></script>\n" +
    "\n" +
    "</body>\n" +
    "</html>");
}]);
