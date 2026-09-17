var fs = require('fs');
var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

// Buscar 'goods' en el archivo
console.log('=== todas las ocurrencias de goods ===');
var idx = 0;
while (true) {
    idx = s.indexOf("'goods'", idx);
    if (idx < 0) break;
    console.log('\n-- pos', idx, '--');
    console.log(s.substring(idx - 80, idx + 120));
    idx++;
}

// Buscar beans.set (donde se "come" el punto)
console.log('\n=== beans.set ===');
var bsIdx = s.indexOf('beans.set');
if (bsIdx >= 0) console.log(s.substring(bsIdx - 100, bsIdx + 200));
else console.log('NO ENCONTRADO');

// Buscar la player update function
console.log('\n=== player update ===');
var puIdx = s.indexOf('player = stage.createItem');
if (puIdx >= 0) console.log(s.substring(puIdx, puIdx + 1500));
