Pow2
================
[![Build Status](https://secure.travis-ci.org/justindujardin/pow2.png)](http://travis-ci.org/justindujardin/pow2)

## Build Instructions

You need to have Node.JS and Grunt.JS installed, and a basic familiarity with executing commands in your system terminal.

### Node.JS

If you don't already have Node.JS, don't worry, there's an installer for your platform.  Go ahead and get it, we'll wait.

Download: [NodeJS](http://nodejs.org/)

Once you're done with that let's make sure it's installed properly.  Type these two commands in your terminal window:

> node --version
>
> npm --version

If those commands both return a value, and no error message, you're ready to go.

### Grunt.JS

Once you have Node.JS installed you can install Grunt.JS via NPM.  Enter these commands in your terminal to install the `grunt` utility.

> npm install -g grunt-cli
>
> grunt --version

If you receive errors, you may need to run this command as an administrator on your OS.  For more detailed information, see
the grunt [Getting Started Guide](http://gruntjs.com/getting-started#installing-the-cli).

Once you've installed grunt and it echos its version back without error, you're ready to install npm dependencies and then 
run your game!

### Build it!

Now that you have `node`, `npm`, and `grunt` installed--you're good to go.  Let's install the npm dependencies and start up the developer workflow:

> npm install

> grunt watch

This command should print information about executing some tasks, and eventually settle down and say that it's run a server at http://localhost:5215/.
Once this happens, just open your browser to that page and you're ready to go.

While the grunt watch task is running the game assets will be rebuilt if a file (Sprites, Maps, Code) changes.  This means you
can edit your files and refresh your webpage a few moments later when the new build is done.  No muss, no fuss, just game stuff.

