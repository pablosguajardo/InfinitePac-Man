var fs = require('fs');
var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

// Ver el draw de beans completo
var beansDrawIdx = s.indexOf('beans = stage.createMap');
console.log('=== beans createMap ===');
console.log(s.substring(beansDrawIdx, beansDrawIdx + 1500));

// Ver también cómo se detectan las power pellets (valor 3)
console.log('\n=== búsqueda de valor 3 en beans ===');
var idx3 = s.indexOf('==3', beansDrawIdx);
var idx3b = s.indexOf('== 3', beansDrawIdx);
console.log('==3 at:', idx3, '  == 3 at:', idx3b);
if (idx3 >= 0) console.log(s.substring(idx3 - 100, idx3 + 200));
if (idx3b >= 0 && idx3b !== idx3) console.log(s.substring(idx3b - 100, idx3b + 200));

// Ver también el item status=3 (modo asustado)
console.log('\n=== status==3 en items ===');
var statusIdx = s.indexOf('item.status==3');
if (statusIdx >= 0) console.log(s.substring(statusIdx - 200, statusIdx + 300));
