# Pow2 [![Build Status](https://travis-ci.org/justindujardin/pow2.svg?branch=master)](https://travis-ci.org/justindujardin/pow2) [![Coverage Status](https://img.shields.io/coveralls/justindujardin/pow2.svg)](https://coveralls.io/r/justindujardin/pow2?branch=master)

Pow is a set of core game classes to support my 2D typescript game experiments.  It has a basic component architecture, serialized entity format, and loads and renders Tiled! TMX maps.

It no longer houses any produced game output except for sprite sheets and core code. For a game example checkout [Angular2 RPG](https://github.com/justindujardin/angular2-rpg).

# Building and Testing

> You need to have Node.JS, Bower, and Grunt.JS installed.  You'll also need a basic familiarity with executing commands in your system terminal.

### Node.JS

[Download](http://nodejs.org/) and install it.

> node --version
>
> npm --version

If those commands both return a value, and no error message, you're ready to go.

### Grunt

Install the `grunt` utility.

> npm install -g grunt-cli
>
> grunt --version

If you receive errors, you may need to run this command as an administrator on your OS.  For more detailed information, see
the grunt [Getting Started Guide](http://gruntjs.com/getting-started#installing-the-cli).


### Grunt

Install the `bower` utility.

> npm install -g bower
>
> bower --version

## Installing

Install the npm dependencies:

> npm install && bower install

## Developing

Once you've installed the project, start up the developer workflow using grunt:

> grunt develop

This will build game sprite sheets, compile core game classes into output files (in `lib/`), and and produce test files.

## Testing

`npm install -g karma-cli` and then `karma start` after having run `grunt develop` 

### Committing

Commit messages should [follow conventions](CONVENTIONS.md)

### JetBrains Open Source

The folks over at [JetBrains](https://www.jetbrains.com/) have been kind enough to sponsor this open source project by providing 
free licenses of [WebStorm](https://www.jetbrains.com/webstorm/) to any serious contributors to the project.  

[![JetBrains](https://www.jetbrains.com/company/docs/logo_jetbrains.png)](https://www.jetbrains.com/) 
[![WebStorm](https://www.jetbrains.com/webstorm/documentation/docs/logo_webstorm.png)](https://www.jetbrains.com/webstorm/)
