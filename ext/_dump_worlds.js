'use strict';
var fs = require('fs');
var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

// Count how many maps are in _COIGIG
var start = s.indexOf('_COIGIG = [');
var end = s.indexOf('];', start);
console.log('_COIGIG from', start, 'to', end);

var section = s.substring(start, end + 2);
// Count how many {'map': entries
var mapCount = 0, pos = 0;
while (true) {
    var i = section.indexOf("'map':", pos);
    if (i < 0) break;
    mapCount++;
    pos = i + 1;
}
console.log('Maps in _COIGIG:', mapCount);

// Show first map's first row to see dimensions
var firstMap = s.indexOf("'map':[", start);
var firstRow = s.substring(firstMap + 7, firstMap + 150);
console.log('First map first rows:\n', firstRow);

// Show the goods section
var goodsPos = s.indexOf("'goods':", start);
console.log('\nGoods at pos:', goodsPos);
console.log(s.substring(goodsPos - 50, goodsPos + 120));
