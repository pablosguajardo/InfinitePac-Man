'use strict';
var fs = require('fs');
var T = '\t', N = '\r\n';

var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

var ok = true;
function esc(str) {
    var o=''; for(var k=0;k<str.length;k++){var c=str.charCodeAt(k);o+=c>127?'\\u'+('0000'+c.toString(16)).slice(-4):str[k];} return o;
}
function rep(str, search, repl, tag) {
    var idx = str.indexOf(search);
    if (idx < 0) { console.error('NOT FOUND: '+tag+' | first80: '+esc(search.slice(0,80))); ok=false; return str; }
    console.log('OK: '+tag+' pos='+idx);
    return str.slice(0,idx)+repl+str.slice(idx+search.length);
}

// ── C1: beans draw ───────────────────────────────────────────────────────────
var t8=T+T+T+T+T+T+T+T, t9=t8+T, t7=T+T+T+T+T+T+T;
var c1s = 'if(!this.get(i,j)){'+N+t8+'var pos = this.coord2position(i,j);'+N+t8+'context.fillStyle = "#F5F5DC";'+N+t8+'if(config[\'goods\'][i+\',\'+j]){'+N+t9+'context.beginPath();'+N+t9+'context.arc(pos.x,pos.y,3+this.times%2,0,2*Math.PI,true);'+N+t9+'context.fill();'+N+t9+'context.closePath();'+N+t8+'}else{'+N+t9+'context.fillRect(pos.x-2,pos.y-2,4,4);'+N+t8+'}'+N+t7+'}';
var c1r = 'var bv=this.get(i,j);'+N+t7+'if(!bv||bv===3){'+N+t8+'var pos = this.coord2position(i,j);'+N+t8+'context.fillStyle = "#F5F5DC";'+N+t8+'if(bv===3||config[\'goods\'][i+\',\'+j]){'+N+t9+'context.beginPath();'+N+t9+'context.arc(pos.x,pos.y,3+this.times%2,0,2*Math.PI,true);'+N+t9+'context.fill();'+N+t9+'context.closePath();'+N+t8+'}else{'+N+t9+'context.fillRect(pos.x-2,pos.y-2,4,4);'+N+t8+'}'+N+t7+'}';
s = rep(s, c1s, c1r, 'beans draw');

// ── C2: player eating ────────────────────────────────────────────────────────
// Buscar por texto estable sin chars especiales
var t6=T+T+T+T+T+T, ta=t8+T+T, t10=ta;
var eatStart = 'if(!beans.get(this.coord.x,this.coord.y)){';
var eatIdx = s.indexOf(eatStart);
if (eatIdx < 0) { console.error('NOT FOUND: player eating anchor'); ok=false; }
else {
    // Encontrar el cierre del if exterior
    var depth = 0, pos = eatIdx;
    for (; pos < s.length; pos++) {
        if (s[pos]==='{') depth++;
        else if (s[pos]==='}') { depth--; if(depth===0){pos++;break;} }
    }
    var eatBlock = s.slice(eatIdx, pos);
    console.log('OK: player eating block found, len='+eatBlock.length);

    var t7e=T+T+T+T+T+T+T;
    var newEat = 'var bv=beans.get(this.coord.x,this.coord.y);'+N+t6+'if(!bv||bv===3){'+N+t7e+'_SCORE++;'+N+t7e+'beans.set(this.coord.x,this.coord.y,1);'+N+t7e+'if(bv===3||config[\'goods\'][this.coord.x+\',\'+this.coord.y]){'+N+t8+'items.forEach(function(item){'+N+t9+'if(item.status==1||item.status==3){'+N+ta+'item.timeout = 450;'+N+ta+'item.status = 3;'+N+t9+'}'+N+t8+'});'+N+t7e+'}'+N+t6+'}';
    s = s.slice(0,eatIdx) + newEat + s.slice(eatIdx+eatBlock.length);
}

// ── C3: switchWorld map.data reset ───────────────────────────────────────────
var t4=T+T+T+T;
var c3s = "map.data = JSON.parse(JSON.stringify(config['map']));"+N+t4+"map.y_length = config['map'].length;"+N+t4+"map.x_length = config['map'][0].length;"+N+t4+"beans.data = JSON.parse(JSON.stringify(config['map']));"+N+t4+"beans.y_length = config['map'].length;";
var c3r = "map.data = JSON.parse(JSON.stringify(config['map']));"+N+t4+"// PSG: value 3=power pellet en beans, 0=caminable en map"+N+t4+"map.data.forEach(function(row,ry){row.forEach(function(v,rx){if(v===3)map.data[ry][rx]=0;});});"+N+t4+"map.y_length = config['map'].length;"+N+t4+"map.x_length = config['map'][0].length;"+N+t4+"beans.data = JSON.parse(JSON.stringify(config['map']));"+N+t4+"beans.y_length = config['map'].length;";
s = rep(s, c3s, c3r, 'switchWorld map.data');

// ── C4: initial map 3->0 (antes de beans=stage.createMap) ────────────────────
var t3=T+T+T;
var beansIdx = s.indexOf("beans = stage.createMap({");
if (beansIdx < 0) { console.error('NOT FOUND: beans createMap'); ok=false; }
else {
    var ins = t3+"map.data.forEach(function(row,ry){row.forEach(function(v,rx){if(v===3)map.data[ry][rx]=0;});});"+N;
    s = s.slice(0,beansIdx)+ins+s.slice(beansIdx);
    console.log('OK: initial map 3->0 inserted at pos='+beansIdx);
}

// ── GUARDAR ───────────────────────────────────────────────────────────────────
if (!ok) { console.error('ABORTED - not saved'); process.exit(1); }
var outBuf = Buffer.from('\uFEFF'+s, 'utf16le');
fs.writeFileSync('app/src/main/assets/www/static/script/index.js', outBuf);
console.log('\nDone. Bytes: '+outBuf.length);
