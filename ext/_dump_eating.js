var fs = require('fs');
var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

// Buscar la sección de player eating sin depender de chars especiales
var i = s.indexOf("beans.get(this.coord.x,this.coord.y)");
console.log("pos:", i);
// Mostrar 50 chars antes y 400 después
var chunk = s.substring(i - 50, i + 400);
// Mostrar como escape unicode para ver exactamente qué hay
var out = '';
for (var k = 0; k < chunk.length; k++) {
    var c = chunk.charCodeAt(k);
    if (c > 127) out += '\\u' + ('0000'+c.toString(16)).slice(-4);
    else out += chunk[k];
}
console.log(out);
