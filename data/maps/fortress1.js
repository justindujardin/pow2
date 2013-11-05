eburp.registerMap("fortress1",{
   name : "Goblin Fortress",
   map : "\
XXXXXXXXXXXXXXXXXXXXXXXMMMMM\
XXXXXXXXXXXX.....XXXXXXMMMMM\
XXXXXXXXXXX...XXGXXXXXXMMMMM\
XX...XXXXXXX..XX...XXXXMMMMM\
XX...XXXXXXXXXXX...XXXXMMMMM\
XX...XXXX...XXXX...XXXXMMMMM\
XXXGXXXXX.X.XXXXX.XXXXXMMMMM\
XXX.XXXXX.X.XXXXXGXXXXXMMMMM\
XXX..XXXX.X.X=========XMMMMM\
XXXX.XXXX.X.X=========XMMMMM\
XXXX.XXXX.X.X=========XMMMMM\
XXXX.XXXX.X.X=========XMMMMM\
XXXX.XXXX.X.X====(===XXMMMMM\
XXXX.XXXX.X.X======XXXXMMM==\
XXXX.XXXX.X.X==(...X..XM(===\
XXXX.XXXX.X......p.G..G=====\
XXXX.XXXX.XXX==(...X..XM(===\
XXX..XXXX.XXX======XXXXMMM==\
XX..XXX...XXX====(===XXMMMMM\
XX.XXXX.XXXXX=========XMMMMM\
XX.XXXX.XXXXX=========XMMMMM\
XX.XXXXGXXXXX=========XMMMMM\
XX.XX....XXXX=========XMMMMM\
XX.XX....XXXXXXXX.XXXXXMMMMM\
XX.XX....XXXXXXXX.XXXXXMMMMM\
XX..G....XXXXXXXX.XXXXXMMMMM\
XXXXXXXXXXXX......XXXXXMMMMM\
XXXXXXXX...X.XXXXXXXXXXMMMMM\
XXXXXXXX...X.XXXXXXXXXXMMMMM\
XXXXXXXX...G.XXXXXXXXXXMMMMM\
XXXXXXXXXXXXXXXXXXXXXXXMMMMM\
",
   width : 28,
   height : 31,
   music : "gurkdemo7",
   dark : true,
   level : 1,
   groups : ["goblin", "default"],
   encounterChance: 35,
   combatMap: "dungeonCombat",
   features : [
      {
         type : "transition",
         x : 22,
         y : 15,
         icon : "dungeonGate.png",
         text : "Will you slip out of the Goblin Fortress and return to the Nothian Forest?",
         target : "wilderness",
         transitionType : "outdoor",
         targetX : 23,
         targetY : 12
      },
      {
         type : "block",
         x : 23,
         y : 15
      },
      {
         type : "encounter",
         id : "goblinGuard",
         x : 13,
         y : 15,
         icon : "goblin7.png",
         text : "A pack of Goblins block your passage!",
         gold : 5,
         creatures : [
            {"name" : "Goblin Warrior", "bonus" : 1, "hitPoints" : 5},
            {"name" : "Goblin Warrior"},
            {"name" : "Goblin"},
            {"name" : "Goblin"},
            {"name" : "Goblin"},
            {"name" : "Goblin"}
         ],
         items : [
            {name : "Goblin Crossbow", bonus : 1}
         ]

      },
      {
         type : "encounter",
         id : "goblinScouts",
         x : 24,
         y : 11,
         icon : "goblinScout.png",
         text : "You are suddenly confronted by nasty and quick-moving Goblins!",
         ambushed : true,
         gold : 6,
         creatures : [
            {"name" : "Goblin Scout", "bonus" : 1, "hitPoints" : 5},
            {"name" : "Goblin Scout", "bonus" : 1, "hitPoints" : 3},
            {"name" : "Goblin Scout"},
            {"name" : "Goblin Scout"},
            {"name" : "Goblin Scout"}
         ],
         items : [
            {"name" : "Goblin Scimitar", "bonus" : 1}
         ]

      },
      {
         type : "encounter",
         id : "pitsShamans",
         x : 3,
         y : 5,
         icon : "goblinWizard.png",
         text : "A Goblin spiritual leader of some variety shouts curses as you approach!",
         gold : 9,
         creatures : [
            {"name" : "Goblin Shaman", "bonus" : 1, "hitPoints" : 10},
            {"name" : "Goblin Warrior", "bonus" : 1, "hitPoints" : 8},
            {"name" : "Goblin Warrior", "bonus" : 1, "hitPoints" : 8}
         ],
         items : [
            {"name" : "Goblin Staff", "bonus" : 1}
         ]

      },
      {
         type : "barrier",
         x : 19,
         y : 15,
         icon : "dungeonGate.png",
         until : "goblinStart",
         title : "Gate",
         text : "There is no way to slip past the heavy gate!"
      },
      {
         type : "alert",
         x : 19,
         y : 15,
         icon : "dungeonGate.png",
         altIcon : "goldKey.png",
         title : "Unlocked",
         text : "You use the golden key provided by the Elves to unlock the heavy gate.",
         sets : "alertGoblinKey",
         until : "alertGoblinKey",
         after : "goblinStart"
      },
      {
         type : "transition",
         x : 3,
         y : 3,
         icon : "doorway.png",
         text : "Unspeakable sounds and smells fill the air as you peer down a long staircase. Dare you descend?",
         target : "fortress2",
         transitionType : "down",
         targetX : 23,
         targetY : 12
      }
   ]
});