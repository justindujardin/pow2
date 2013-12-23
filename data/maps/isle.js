eburp.registerMap("isle",{
   name : "Wandering Isle",
   map : "\
~~AAA~~AAAAAAAA~~~~~~~~~~\
~AAAA~~AAAAAAAAAAAAA~~~~~\
~AAAAA~AAAAAAAAAAAA~~~~~~\
AAAAAAAAAAAAAAAAA~~~~~~~~\
AAAAAAAA:TTTAAATA:T~~~~~~\
AAAAAAA:TTAAA:::::TT~~~~~\
AAAA::A:::::A:::T::TT~~~~\
~AAAA:A:::AAA:::::::~~~~~\
~AAAA:::::::::::::::T~~~~\
~AAA:::::::::::::|~::~~~~\
~~~A:::T:::T::::~|~~:~~~~\
~~~~:::::::TT:::~~~~~~~~~\
~/~~T:::::TTTTT~~~~~~~~~~\
~~~~~T::~~:TTTT~~~~~~~~~~\
~~~~:::~~~~TTT~~~~~~~~~~~\
~~~~~~~~~~~~~~~~~~~~~~~~~\
~~/~~~~~~~~~~~~~~~~~~~~~~\
~~~~~~~~~~~~~~~~~~~~~~~~~\
~~~~~~~~~~~~~~~~~~~~~~~~~\
",
   width : 25,
   height : 19,
   music : "gurkdemo9",
   dark : false,
   level : 1,
   groups : ["default"],
   encounterChance: 0,
   combatMap: "outdoorCombat",
   features : [
      {
         type : "transition",
         x : 17,
         y : 10,
         icon : "bridgeVertical.png",
         text : "Will you weigh anchor and set sail again upon the Wandering Sea?",
         target : "wilderness",
         transitionType : "outdoor",
         targetX : 83,
         targetY : 46
      },
      {
         type : "sign",
         x : 14,
         y : 10,
         icon : "pirate.png",
         action : "TALK",
         title : "Pirate",
         text : "'Tis a foul wind a blownin' since that volcano blew its top. Me mates 'n I can barely sail, and there be nary finer sailors in the Kingdoms Three than me mates 'n me."
      },
      {
         type : "sign",
         x : 7,
         y : 13,
         icon : "pirate2.png",
         action : "TALK",
         title : "Pirate",
         text : "Aye, we be stockin' none but the finest goods here on the Wanderin' Isle. Yet the trade be diminishin' in recent years."
      },
      {
         type : "store",
         name : "Buccaneer's Bazaar",
         x : 8,
         y : 7,
         icon : "shop.png",
         level : 5,
         groups : ["default", "water"],
         buyRate : 130,
         sellRate : 25
      },
      {
         type : "sign",
         x : 17,
         y : 11,
         icon : "ship.png"
      }
   ]
});