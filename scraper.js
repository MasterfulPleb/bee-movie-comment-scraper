'use strict';
const mariadb = require('mariadb');
const snoowrap = require('snoowrap');
const login = require('./login.json');
const r = new snoowrap(login);
const start = 'hb3v6zj'; //ID of starting comment

main();

async function main() {
    var nextComment = start;
    var commentCount = 0
    var conn;
    var working = false;
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
            if (working) { //graceful error handling cause i cant async properly
                console.warn('async collision, sleeping')
            } else if (r.ratelimitRemaining == 0) {
                console.warn('ratelimit exceeded, sleeping')
            } else try {
                working = true
                //get next comment
                var c = await r.getComment(nextComment).fetch();
                //push comment to DB
                conn.query('INSERT INTO comments ' +
                    '(ID,body,author,timestamp,parentID,permalink,edited,OP,awards)' +
                    'VALUES("' + c.id + '","' + c.body + '","' + c.author.name + '",' +
                    c.created_utc + ',"' + c.parent_id.slice(3) + '","' + c.permalink + '",' +
                    (c.edited > 0) + ',' + c.is_submitter + ',' + c.total_awards_received + ');'
                );
                nextComment = c.parent_id.slice(3);
                commentCount++
                console.log('comments recorded: ' + commentCount);
                console.log('ratelimit remaining: ' + r.ratelimitRemaining);
                if (nextComment == 'ofiegh') {
                    conn.close(); //close the MariaDB connection
                    clearInterval(pushComment); //stop at top comment
                }
                working = false
            } catch (err) {   //catches errors (DB duplicates hopefully) that the graceful handling
                conn.close(); //up above should have prevented, and ends the process
                clearInterval(pushComment);
                console.log(err);
            }
        }, 1020);
    } catch (err) { //error handling
        console.log(err);
        conn.close();
        clearInterval(pushComment);
    }
}
