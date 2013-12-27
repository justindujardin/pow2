"use strict";
var path = require('path');
var Q = require('q');
var _ = require('underscore');
var fs = require('graceful-fs');
var PNG = require('pngjs').PNG;
var boxPacker = require('binpacking').GrowingPacker;

function scalePng(png, scale) {
    scale = Math.floor(scale);
    var scaledPng = new PNG({
        width: png.width * scale,
        height: png.height * scale,
        filterType: 0
    });
    for (var y = 0; y < scaledPng.height; y++) {
        for (var x = 0; x < scaledPng.width; x++) {
            var baseX = Math.floor(x / scale);
            var baseY = Math.floor(y / scale);
            var baseIdx = (png.width * baseY + baseX) << 2;
            var idx = (scaledPng.width * y + x) << 2;

            scaledPng.data[idx] = png.data[baseIdx];
            scaledPng.data[idx + 1] = png.data[baseIdx + 1];
            scaledPng.data[idx + 2] = png.data[baseIdx + 2];
            scaledPng.data[idx + 3] = png.data[baseIdx + 3];
        }
    }
    scaledPng.end();
    return scaledPng;
}

function readPngData(file, scale) {
    var deferred = Q.defer();
    var readFile = Q.denodeify(fs.readFile);
    return readFile(file).then(function (data) {
        var stream = new PNG();
        stream.on('parsed', function () {
            var png = scale > 1 ? scalePng(this, scale) : this;
            stream.end();
            deferred.resolve({
                png: png,
                file: file
            });
        });
        stream.write(data);
        return deferred.promise;
    });
}

function clearFillPng(png) {
    for (var y = 0; y < png.height; y++) {
        for (var x = 0; x < png.width; x++) {
            var idx = (png.width * y + x) << 2;
            png.data[idx] = png.data[idx + 1] = png.data[idx + 2] = png.data[idx + 3] = 0;
        }
    }
    return png;
}

function writePackedImage(name, cells, width, height, spriteSize, scale) {
    var deferred = Q.defer();
    var stream = new PNG({
        width: width,
        height: height
    });
    clearFillPng(stream);
    var baseName = path.basename(name);
    var pngName = name + '.png';
    var writer = fs.createWriteStream(pngName);
    _.each(cells, function (cell) {
        cell.png.bitblt(stream, 0, 0, cell.width, cell.height, cell.x, cell.y);
    });
    stream.on('end', function () {
        var metaData = {};
        _.each(cells, function (cell) {
            var fileName = cell.file.substr(cell.file.lastIndexOf("/") + 1);
            var index = (cell.x / (spriteSize * scale)) + (cell.y / (spriteSize * scale)) * (width / spriteSize);
            metaData[fileName] = {
                frames: cell.png.width / (spriteSize * scale),
                source: baseName,
                index: index,
                x: cell.x,
                y: cell.y
            };

            cell.png.end();
        });

        deferred.resolve({
            file: pngName,
            name: baseName,
            meta: metaData
        });
        writer.end();
    });
    stream.pack().pipe(writer);
    return deferred.promise;
}

module.exports = function (files, options) {
    options = _.extend({}, {
        outName: 'spriteSheet',
        scale: 1
    }, options || {});
    var SOURCE_SPRITE_SIZE = 16;
    if (path.extname(options.outName) !== '') {
        options.outName = options.outName.substr(0, options.outName.lastIndexOf('.'));
    }
    files = _.filter(files, function (file) {
        return path.extname(file) == '.png';
    });
    var readFiles = _.map(files, function (file) {
        return readPngData(file, options.scale);
    });
    return Q.all(readFiles).then(function (fileDatas) {
        var blocks = _.map(fileDatas, function (d) {
            return {
                w: d.png.width,
                h: d.png.height,
                data: d
            };
        });
        var packer = new boxPacker();
        packer.fit(blocks);
        var cells = _.map(blocks, function (b) {
            return {
                width: b.w,
                height: b.h,
                x: b.fit.x,
                y: b.fit.y,
                png: b.data.png,
                file: b.data.file
            };
        });
        return writePackedImage(options.outName, cells, packer.root.w, packer.root.h, SOURCE_SPRITE_SIZE, options.scale);
    });
};
//# sourceMappingURL=spritePacker.js.map
