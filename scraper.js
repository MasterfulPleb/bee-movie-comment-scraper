'use strict';
const mariadb = require('mariadb');
const snoowrap = require('snoowrap');
const login = require('./login.json');
const r = new snoowrap(login);
const start = 'hbxr2az'; //ID of starting comment

main();

//it doesnt need to be a function i guess but it looks more professional
async function main() {
    var nextComment = start;
    var commentCount
    var conn;
    try {
        //connects to MariaDB
        conn = await mariadb.createConnection({
            socketPath: '/var/run/mysqld/mysqld.sock',
            user: 'root',
            database: 'bee_movie'
        });
        //the meat of the script
        //goes up the chain adding every comment in the main thread to the DB
        var pushComment = setInterval(async function() {
            //get next comment
            var c = await r.getComment(nextComment).fetch();
            //push comment to DB
            conn.query('INSERT INTO comments ' +
                '(ID,body,author,timestamp,parentID,permalink,edited,OP,awards)' +
                'VALUES("' + c.id + '","' + c.body + '","' + c.author.name + '",' +
                c.created_utc + ',"' + c.parent_id.slice(3) + '","' + c.permalink + '",' +
                (c.edited > 0 ? 1: 0) + ',' + c.is_submitter + ',' + c.total_awards_received + ');'
            );
            nextComment = c.parent_id.slice(3);
            console.log('comments recorded:' + commentCount);
            console.log('ratelimit remaining: ' + r.ratelimitRemaining);
            if (nextComment == 'ofiegh') {
                conn.close(); //close the MariaDB connection
                clearInterval(pushComment); //stop at top comment
            }
        }, 1020);
    } catch (err) {
        //error handling
        console.log(err);
    }
}
