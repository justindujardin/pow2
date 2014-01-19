///<reference path="../source/core/api.ts"/>
pow2.registerData("quests",{ // This populates the QUESTS view. Quests are triggered by variables been set based on the map features below
   "The Chosen Path" :
   {
      graphId:"the_chosen_path",
      done : "ruinsStart",
      text : "Agree to investigate the ruins of Kinstown harbor."
   },
   "Kinstown Ruins" :
   {
      graphId:"kinstown_ruins",
      started : "ruinsStart",
      done : "ruinsDone",
      icon : "oldMan.png",
      text : "Discover and defeat the evil force that is occupying the ruins of Kinstown Harbor."
   },
   "Forest of Nothia" :
   {
      graphId:"forest_of_nothia",
      started : "portStart",
      done : "portDone",
      icon : "man3.png",
      text : "Visit the Forest of Nothia and speak with the Elvish Council in Port Artha."
   },
   "Goblin Fortress" :
   {
      graphId:"goblin_fortress",
      started : "goblinStart",
      done : "goblinDone",
      icon : "gnomeKing.png",
      text : "Defeat the Goblin King that is terrorizing the Nothian Forest."
   },
   "Castle Bashgar" :
   {
      graphId:"castle_bashgar",
      started : "castleStart",
      done : "castleDone",
      icon : "gnomeKing.png",
      text : "Sail the Wandering Sea South and East to the Great Suvian Desert, then seek an audience with the King in Castle Bashgar."
   },
   "Ashvari Crypts" :
   {
      graphId:"ashvari_crypts",
      started : "cryptsStart",
      done : "cryptsDone",
      icon : "emperor.png",
      text : "Defeat the evil undead that has corrupted the ancient Ashvari Crypts."
   },
   "Roogard Keep" :
   {
      graphId:"roogard_keep",
      started : "keepStart",
      done : "keepDone",
      icon : "emperor.png",
      text : "Sail North and East to the Warvish Tundralands and beseech the Dwarvish Chieftan to open the gate to Mount Vezu."
   },
   "Vygurn Tower" :
   {
      graphId:"vygurn_tower",
      started : "towerStart",
      done : "towerDone",
      icon : "dwarfKing.png",
      text : "Defeat the magi in Vygurn Tower to open the passage to Mount Vezu."
   },
   "Mount Vezu" :
   {
      graphId:"mount_vezu",
      started : "vezuStart",
      done : "gameOver",
      icon : "oolanMaster.png",
      text : "Sail North and West to the volcano, then confront the ancient dragon Vezu."
   }
});