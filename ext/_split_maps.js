'use strict';
var fs = require('fs');
var buf = fs.readFileSync('app/src/main/assets/www/static/script/index.js');
var s = buf.toString('utf16le');
if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);

// Extract the big map array
var mapStart = s.indexOf("'map':[") + 7;
var mapEnd = s.indexOf("\n\t\t\t],", mapStart);
var mapStr = s.substring(mapStart, mapEnd);

// Parse rows
var rows = [];
var lines = mapStr.split('\n');
for (var i = 0; i < lines.length; i++) {
    var l = lines[i].trim();
    if (l.startsWith('[') && l.endsWith('],')) {
        var inner = l.slice(1, l.lastIndexOf(']'));
        rows.push(inner.split(',').map(Number));
    } else if (l.startsWith('[') && l.endsWith(']')) {
        var inner = l.slice(1, l.lastIndexOf(']'));
        rows.push(inner.split(',').map(Number));
    }
}
console.log('Total rows:', rows.length);
// 12 maps * 31 rows = 372, but with duplicated join rows it could be more
// Find segment boundaries by looking for //PSG union de mapa
var segStarts = [0];
var inComment = false;
var lineIdx = 0;
var rowIdx = 0;
// Re-parse tracking comments
for (var i = 0; i < lines.length; i++) {
    var l = lines[i].trim();
    if (l.includes('//PSG union de mapa')) {
        // The NEXT data row after this comment starts a new segment
        // but actually the duplicate row IS still part of the combined map
        // Let's just track where the duplicate rows are
        segStarts.push(rowIdx);
    } else if (l.startsWith('[')) {
        rowIdx++;
    }
}
console.log('Segment boundaries (row indices):', segStarts);
console.log('Rows per segment:', segStarts.map(function(s,i){ return segStarts[i+1] ? segStarts[i+1]-s : rows.length-s; }));
