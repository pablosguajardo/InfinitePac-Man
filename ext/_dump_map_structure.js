'use strict';
var fs = require('fs');
var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

var start = s.indexOf('_COIGIG = [');
// Find the real end - after _COLOR
var colorPos = s.indexOf('_COLOR', start);
console.log('_COLOR at:', colorPos);
// The ]; before _COLOR
var end = s.lastIndexOf('];', colorPos);
console.log('Real _COIGIG end:', end);
console.log('Section length:', end - start);

var section = s.substring(start, end + 2);

// Count map entries
var mapCount = 0, pos = 0;
while (true) {
    var i = section.indexOf("'map'", pos);
    if (i < 0) break;
    mapCount++;
    pos = i + 1;
}
console.log("'map' occurrences:", mapCount);

// Count top-level { objects
var depth = 0, objCount = 0;
for (var k = 11; k < section.length; k++) { // skip '_COIGIG = ['
    if (section[k] === '{') { depth++; if(depth===1) objCount++; }
    else if (section[k] === '}') depth--;
}
console.log('Top-level {} objects:', objCount);

// Show positions of each top-level {
depth = 0;
var starts = [];
for (var k = 11; k < section.length; k++) {
    if (section[k] === '{') { depth++; if(depth===1) starts.push(k); }
    else if (section[k] === '}') depth--;
}
console.log('Object start positions:', starts.length, starts.slice(0,5));
