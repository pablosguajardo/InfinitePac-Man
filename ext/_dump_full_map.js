'use strict';
var fs = require('fs');
var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

var mapStart = s.indexOf("'map':[") + 7;
var mapEnd = s.indexOf("\n\t\t\t],", mapStart);
var mapStr = s.substring(mapStart, mapEnd + 5);
console.log('Map section len:', mapStr.length);
console.log(mapStr);
