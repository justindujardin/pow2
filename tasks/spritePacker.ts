///<reference path="../types/node/node.d.ts"/>
///<reference path="../types/q/Q.d.ts"/>

import path = require('path');
import Q = require('q');
var _ = require('underscore');
var fs:any = require('graceful-fs');
var PNG = require('pngjs').PNG;
var boxPacker = require('binpacking').GrowingPacker;

/**
 * Scale an image up/down by an integer scaling factor.
 * @param {PNG} png The pngjs PNG instance to scale.
 * @param {Number} scale The scale factor to apply.  This is floored to an integer value.
 * @returns {PNG} The scaled PNG instance.
 */
function scalePng(png:any, scale:number) {
  scale = Math.floor(scale);
  var scaledPng = new PNG({
    width: png.width * scale,
    height: png.height * scale,
    filterType: 0
  });
  for (var y = 0; y < scaledPng.height; y++) {
    for (var x = 0; x < scaledPng.width; x++) {

      // Source texture data index
      var baseX = Math.floor(x / scale);
      var baseY = Math.floor(y / scale);
      var baseIdx = (png.width * baseY + baseX) << 2;
      var idx = (scaledPng.width * y + x) << 2;

      // Apply source index to scaled image
      scaledPng.data[idx] = png.data[baseIdx];
      scaledPng.data[idx + 1] = png.data[baseIdx + 1];
      scaledPng.data[idx + 2] = png.data[baseIdx + 2];
      scaledPng.data[idx + 3] = png.data[baseIdx + 3];
    }
  }
  scaledPng.end();
  return scaledPng;
}

/**
 * Read PNG data for a file, and resolve with an object containing the file name
 * and the PNG object instance representing its data.
 *
 * This can associate meta-data with a png file if it has an accompanying .json file
 * of the same name, in the same directory.  The system will also look for a defaults
 * file that will be applied to all sprites in the directory.
 */
function readPngData(file:string, scale:number) {
  var defaultsFile = "spriteDefaults.json";
  var deferred = <any>Q.defer();
  var readFile = (<any>Q).denodeify(fs.readFile);
  Q.all([
    readFile(file),
    readPngMetaData(path.join(path.dirname(file), defaultsFile), scale),
    readPngMetaData(file, scale)
  ]).spread(function (data:any, defaultMeta:any, meta:any) {
    var stream = new PNG();
    stream.on('parsed', function () {
      var png = scale > 1 ? scalePng(this, scale) : this;
      stream.end();
      deferred.resolve({
        png: png,
        meta: _.extend({}, defaultMeta || {}, meta || {}),
        file: file
      });
    });
    stream.write(data);
  }).catch((err:any) => {
    deferred.reject(err);
  });
  return deferred.promise;
}


/**
 * Read PNG JSON metadata and resolve with its object or null.
 */
function readPngMetaData(file:string, scale:number) {
  var deferred = <any>Q.defer();
  var file = file.replace(/\.[^\.]+$/, '.json');
  fs.readFile(file, 'utf-8', function (err:any, data:any) {
    if (err) {
      // Do not treat failures as failure.  If sprite metadata is
      // missing, the default will be used.
      deferred.resolve(null);
      return;
    }
    try {
      var obj = JSON.parse(data.toString());
      deferred.resolve(obj);
    }
    catch (e) {
      // DO fail on bad format
      deferred.reject(e);
    }
  });
  return deferred.promise;
}

function clearFillPng(png:any) {
  for (var y = 0; y < png.height; y++) {
    for (var x = 0; x < png.width; x++) {
      var idx = (png.width * y + x) << 2;
      png.data[idx] = png.data[idx + 1] = png.data[idx + 2] = png.data[idx + 3] = 0;
    }
  }
  return png;
}

/**
 * Write out a composite PNG image that has been packed into a sheet,
 * and a JSON file that describes where the sprites are in the sheet.
 */
function writePackedImage(name:string, cells:number, width:number, height:number, spriteSize:number, scale:number) {
  var deferred = <any>Q.defer<any>();
  var stream = new PNG({
    width: width,
    height: height
  });
  clearFillPng(stream);
  var baseName = path.basename(name);
  var pngName = name + '.png';
  var writer = fs.createWriteStream(pngName);
  _.each(cells, function (cell:any) {
    cell.png.bitblt(stream, 0, 0, cell.width, cell.height, cell.x, cell.y);
  });
  stream.on('end', function () {
    // Last transformation: produce expected gurk output format.
    // Don't mark block, just set to 0.
    var metaData:any = {};
    _.each(cells, function (cell:any) {
      var fileName = cell.file.substr(cell.file.lastIndexOf("/") + 1);
      var index = (cell.x / (spriteSize * scale)) + (cell.y / (spriteSize * scale)) * (width / spriteSize);
      var width = cell.png.width * scale;
      var height = cell.png.height * scale;
      // TODO: Interface this.
      var metaObj:any = {
        width: width,
        height: height,
        frames: 1,
        source: baseName,
        index: index,
        x: cell.x,
        y: cell.y
      };
      // If the cell meta file specifies cellWidth/Height calculate frames based on that.
      if (cell.meta) {
        _.extend(metaObj, cell.meta);
        var hasWidth = typeof metaObj.cellWidth !== 'undefined';
        var hasHeight = typeof metaObj.cellHeight !== 'undefined';
        if (hasWidth && hasHeight) {
          metaObj.frames = (cell.png.width / metaObj.cellHeight) * (cell.png.height / metaObj.cellHeight);
        }
      }
      metaData[fileName] = metaObj;
      // Clean up the png stream.
      cell.png.end();
    });

    writer.end();
    deferred.resolve({
      file: pngName,
      name: baseName,
      meta: metaData
    });
  });
  stream.pack().pipe(writer);
  return deferred.promise;
}

/**
 * Sprite packing function.  Takes an array of file names, an output name,
 * and an optional scale/callback.
 */
module.exports = function (files:string[], options:any) {
  options = _.extend({}, {
    outName: 'spriteSheet',
    scale: 1
  }, options || {});
  var SOURCE_SPRITE_SIZE = 16;
  if (path.extname(options.outName) !== '') {
    options.outName = options.outName.substr(0, options.outName.lastIndexOf('.'));
  }
  files = _.filter(files, function (file:string) {
    return path.extname(file) == '.png';
  });
  var readFiles = _.map(files, function (file:string) {
    return readPngData(file, options.scale);
  });
  return Q.all(readFiles).then(function (filesData) {
    var blocks = _.map(filesData, function (d:any) {
      return {
        w: d.png.width,
        h: d.png.height,
        data: d
      };
    });

    // If blocks are not a consistent size, we need to sort them by extent to keep
    // the binpacking algorithm from puking.
    //
    // TODO: Pick a better packing library that can handle varied block sizes
    var needSort:boolean = false;
    var blockW:number = -1;
    var blockH:number = -1;
    blocks.forEach((block:any) => {
      if ((blockW !== -1 && block.w !== blockW) || (block.h !== blockH && blockH !== -1)) {
        needSort = true;
      }
      blockW = block.w;
      blockH = block.h;
    });
    if (needSort) {
      console.log("Sorting " + options.outName + " by size, because it contains sprites of varying sizes.");
      blocks = blocks.sort((a:any, b:any) => {
        return a.w - b.w;
      });
    }
    else {
      blocks = blocks.sort((a:any, b:any) => {
        return path.basename(a.data.file).localeCompare(path.basename(b.data.file));
      });
    }

    var packer = new boxPacker();
    packer.fit(blocks);
    var cells = _.map(blocks, function (b:any) {
      return {
        width: b.w,
        height: b.h,
        x: b.fit.x,
        y: b.fit.y,
        png: b.data.png,
        meta: b.data.meta,
        file: b.data.file
      };
    });
    return writePackedImage(options.outName, cells, packer.root.w, packer.root.h, SOURCE_SPRITE_SIZE, options.scale)
  });
};
