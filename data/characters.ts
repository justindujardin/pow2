///<reference path="../source/core/api.ts"/>

//// Character Classes
pow2.registerData("characters",[
   {
      "name" : "Sir Rugnar",
      "job" : "Knight",
      "type" : "warrior",
      "icon" : "knight.png",
      "bestAttribute" : "strength",
      "description" : "Strong, proud and resolute, Sir Rugnar will always faithfully defend his companions valiantly.",
      "strength" : 3,
      "hitPoints" : 4
   },
   {
      "name" : "Lady Alwyn",
      "job" : "Amazon",
      "type" : "warrior",
      "icon" : "girlKnight.png",
      "bestAttribute" : "strength",
      "description" : "Lady Alwyn was trained in an elite and secretive female fighting force called the 'Amazons'.",
      "strength" : 3,
      "accuracy" : 5,
      "awareness" : -5,
      "hitPoints" : 4
   },
   {
      "name" : "Oloman",
      "after" : "won", // Only appears after the game is won
      "job" : "Mercenary",
      "type" : "warrior",
      "icon" : "mercenary.png",
      "bestAttribute" : "strength",
      "description" : "Oloman is an unscrupulous warrior-for-hire. His only two motivations are self-preservation and profit.",
      "strength" : 3,
      "awareness" : 5,
      "constitution" : -5,
      "hitPoints" : 4
   },
   {
      "name" : "Feraldan",
      "job" : "Marksman",
      "type" : "archer",
      "icon" : "ranger.png",
      "bestAttribute" : "accuracy",
      "description" : "Incredibly dedicated, Feraldan began learning the skill of archery as soon as he was old enough to hold a bow.",
      "accuracy" : 3,
      "hitPoints" : 2
   },
   {
      "name" : "Silvana",
      "job" : "Ranger",
      "type" : "archer",
      "icon" : "girlArcher.png",
      "bestAttribute" : "accuracy",
      "description" : "Raised in the deep Shavanoth forest, Silvana is extraordinarily tough while also very talented with a bow.",
      "accuracy" : 3,
      "constitution" : 5,
      "awareness" : -5,
      "hitPoints" : 2
   },
   {
      "name" : "Grath",
      "after" : "won",
      "job" : "Assassin",
      "type" : "archer",
      "icon" : "assassin.png",
      "bestAttribute" : "accuracy",
      "description" : "Grath belongs to the shadowy League of Assassins. He is deadly in combat, but where his loyalties lie are uncertain.",
      "accuracy" : 3,
      "strength" : 5,
      "constitution" : -5,
      "hitPoints" : 2
   },
   {
      "name" : "Gorlok",
      "job" : "Wizard",
      "type" : "mage",
      "icon" : "wizard.png",
      "bestAttribute" : "awareness",
      "description" : "Gorlok's diverse magical abilities are the result of a keen mind and assiduous studies.",
      "awareness" : 3,
      "hitPoints" : 1
   },
   {
      "name" : "Gaelabeth",
      "job" : "Druid",
      "type" : "mage",
      "icon" : "girlWizard.png",
      "bestAttribute" : "awareness",
      "description" : "Gaelabeth was trained in the non-violent Druidic arts, but left the Order to pursue a wider study of the occult.",
      "awareness" : 3,
      "constitution" : 5,
      "strength" : -5,
      "hitPoints" : 1
   },
   {
      "name" : "B'Az Aptar",
      "after" : "won",
      "job" : "Necromancer",
      "type" : "mage",
      "icon" : "necromancer.png",
      "bestAttribute" : "awareness",
      "description" : "B'Az Aptar has broken the Oath of the Benevolent Magi and begun tinkering with the Dark Arts. But does he control the powerful undead forces, or do they control him?",
      "awareness" : 3,
      "accuracy" : 5,
      "constitution" : -5,
      "hitPoints" : 1
   },
   {
      "name" : "Bag of Holding", // A 'hack' placeholder party member that just holds items.
      "job" : "Bag",
      "type" : "bag",
      "icon" : "bag.png",
      "bestAttribute" : "awareness",
      "description" : "The Bag of Holding can hold as much weight as a large person can carry, yet always remains as light to carry as it is when empty.",
      "awareness" : 1,
      "strength" : 1,
      "accuracy" : -1,
      "hitPoints" : 1
   }

]);