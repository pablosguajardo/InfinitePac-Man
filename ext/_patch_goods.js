// Parche para soportar valor 3 en el mapa como power pellet
// 1. map.data: convierte 3->0 (para que sea caminable en colisión)
// 2. beans draw: dibuja círculo grande cuando value==3
// 3. player eating: cuando come un 3, activa modo asustado de fantasmas

var fs = require('fs');
var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

var original = s;
var changes = 0;

// ─────────────────────────────────────────────────────
// CAMBIO 1: en beans draw, soportar value==3 como power pellet
// Original:
//   if(!this.get(i,j)){
//     ...
//     if(config['goods'][i+','+j]){
// Nuevo: también dibujar si value==3, y detectarlo como power pellet
// ─────────────────────────────────────────────────────
var beansDrawSearch = "if(!this.get(i,j)){\r\n\t\t\t\t\t\t\tvar pos = this.coord2position(i,j);\r\n\t\t\t\t\t\t\tcontext.fillStyle = \"#F5F5DC\";\r\n\t\t\t\t\t\t\tif(config['goods'][i+','+j]){\r\n\t\t\t\t\t\t\t\tcontext.beginPath();\r\n\t\t\t\t\t\t\t\tcontext.arc(pos.x,pos.y,3+this.times%2,0,2*Math.PI,true);\r\n\t\t\t\t\t\t\t\tcontext.fill();\r\n\t\t\t\t\t\t\t\tcontext.closePath();\r\n\t\t\t\t\t\t\t}else{\r\n\t\t\t\t\t\t\t\tcontext.fillRect(pos.x-2,pos.y-2,4,4);\r\n\t\t\t\t\t\t\t}";
var beansDrawReplace = "var bv=this.get(i,j);\r\n\t\t\t\t\t\tif(!bv||bv===3){\r\n\t\t\t\t\t\t\tvar pos = this.coord2position(i,j);\r\n\t\t\t\t\t\t\tcontext.fillStyle = \"#F5
