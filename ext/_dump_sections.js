var fs = require('fs');
var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

// Sección 1: beans draw (donde detecta goods)
var i1 = s.indexOf("if(!this.get(i,j)){");
var i1end = s.indexOf("}\r\n\t\t\t\t\t}", i1);
console.log("=== BEANS DRAW (pos " + i1 + " a " + i1end + ") ===");
console.log(JSON.stringify(s.substring(i1, i1end + 7)));

// Sección 2: player eating (beans.set)
var i2 = s.indexOf("if(!beans.get(this.coord.x,this.coord.y)){");
var i2end = s.indexOf("}\r\n\t\t\t\t\t\t}", i2);
console.log("\n=== PLAYER EATING (pos " + i2 + " a " + i2end + ") ===");
console.log(JSON.stringify(s.substring(i2, i2end + 8)));

// Sección 3: map init (después de map = stage.createMap, para reemplazar 3->0)
var i3 = s.indexOf("map = stage.createMap({");
var i3end = s.indexOf("});\r\n\t\t\t//", i3);
console.log("\n=== MAP createMap end (pos " + i3end + ") ===");
console.log(JSON.stringify(s.substring(i3end - 10, i3end + 30)));

// Sección 4: switchWorld - map.data reset
var i4 = s.indexOf("map.data = JSON.parse(JSON.stringify(config['map']));");
console.log("\n=== SWITCHWORLD map.data reset (pos " + i4 + ") ===");
console.log(JSON.stringify(s.substring(i4, i4 + 250)));
