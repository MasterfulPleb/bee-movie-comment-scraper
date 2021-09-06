'use strict';
const snoowrap = require('snoowrap');
const login = require('./login.json');
const r = new snoowrap(login);
console.log(login);
console.log(r);
r.getComment('hbuj3le').expandReplies({depth: 30}).then(d => {
    debugger;
    console.log(d);
});

/*.then(d => {
    let t = d;
    debugger;
});*/
