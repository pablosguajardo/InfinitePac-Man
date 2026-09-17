'use strict';
var fs = require('fs');
var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

var swPos = s.indexOf('switchWorld');
console.log('switchWorld first at:', swPos);

// Show surrounding context of first occurrence (definition)
// Find function definition
var defPos = s.indexOf('function switchWorld');
if (defPos < 0) defPos = s.indexOf('switchWorld = function');
if (defPos < 0) defPos = s.indexOf('var switchWorld');
console.log('switchWorld def at:', defPos);
if (defPos >= 0) console.log(s.substring(defPos, defPos + 800));

// Also show the map edge values - first map first/last rows
var mapStart = s.indexOf("'map':[");
var mapContent = s.substring(mapStart + 7, mapStart + 300);
console.log('\nFirst rows of map:\n', mapContent);
var mapEnd = s.lastIndexOf('],\n\t\t\t\t],');
var lastRows = s.substring(mapEnd - 200, mapEnd + 20);
console.log('\nLast rows of map:\n', lastRows);
