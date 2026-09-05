const i = require('@hugeicons/core-free-icons');
const k = Object.keys(i);
const matches = k.filter(function(n) { return /lass|up|lask|ine|ragile|hield/i.test(n); });
console.log(matches.slice(0, 20).join(', '));
