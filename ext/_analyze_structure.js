'use strict';
var fs = require('fs');
var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

// Count _COIGIG entries
var coigigStart = s.indexOf('_COIGIG=[');
var coigigEnd = s.indexOf('];', coigigStart);
var coigigSection = s.substring(coigigStart, coigigEnd);

// Count wall_color entries (one per world config)
var wallColorCount = (coigigSection.match(/'wall_color'/g) || []).length;
console.log('Number of _COIGIG entries (wall_color count):', wallColorCount);

// Count 'map':[ occurrences
var mapCount = (coigigSection.match(/'map':\[/g) || []).length;
console.log('Number of map arrays:', mapCount);

// Count //PSG union de mapa
var psgCount = (coigigSection.match(/\/\/PSG union de mapa/g) || []).length;
console.log('Number of //PSG union de mapa markers:', psgCount);

// Count //init markers
var initCount = (coigigSection.match(/\/\/init/g) || []).length;
console.log('Number of //init markers:', initCount);

// How many rows in total across all maps
var rowMatches = coigigSection.match(/\[[0-9,\s]+\]/g) || [];
console.log('Total row arrays found:', rowMatches.length);

// Find map: positions and count rows in each
var pos = 0;
var mapIdx = 0;
while (true) {
    var mp = coigigSection.indexOf("'map':[", pos);
    if (mp < 0) break;
    // find closing ]
    var depth = 0;
    var i = mp + 7;
    var rowCount = 0;
    while (i < coigigSection.length) {
        if (coigigSection[i] === '[') depth++;
        if (coigigSection[i] === ']') {
            if (depth === 0) break;
            depth--;
            rowCount++;
        }
        i++;
    }
    console.log('Map', mapIdx, ': rows =', rowCount);
    mapIdx++;
    pos = mp + 1;
}
