'use strict';
var fs = require('fs');
var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
var pos = 0, count = 0, positions = [];
while (true) {
    var i = s.indexOf("'goods'", pos);
    if (i < 0) break;
    count++;
    positions.push(i);
    pos = i + 1;
}
console.log('goods count:', count);
positions.forEach(function(p) {
    console.log('  pos:', p, '|', s.substring(p, p + 60));
});
