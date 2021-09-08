'use strict';
const mariadb = require('mariadb');
const snoowrap = require('snoowrap');
const login = require('./login.json');
const r = new snoowrap(login);
const start = 'h4g9z7p'; //ID of starting comment

main();

async function main() {
    var nextComment = start;
    var commentCount = 0
    /** @type {Promise<mariadb.Connection>} */
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
            try {
                if (working)
                    throw new Error('at setInterval(): async collision. sleeping...');
                if (r.ratelimitRemaining == 0)
                    throw new Error('at setInterval(): ratelimit exceeded. sleeping...');
                working = true;
                //get next comment
                /** @type {Promise<snoowrap.Comment>} */
                var c = await r.getComment(nextComment).fetch();
                //push comment to DB
                conn.query('INSERT INTO comments ' +
                    '(ID,body,author,timestamp,parentID,permalink,edited,OP,awards)' +
                    'VALUES("' + c.id + '","' + c.body + '","' + c.author.name + '",' +
                    c.created_utc + ',"' + c.parent_id.slice(3) + '","' + c.permalink + '",' +
                    (c.edited > 0) + ',' + c.is_submitter + ',' + c.total_awards_received + ');')
                        .catch(err => { //sequel error catching
                            console.error(err);
                            clearInterval(pushComment);
                            conn.close()
                            process.abort
                        });
                nextComment = c.parent_id.slice(3);
                commentCount++
                console.log('comments recorded: ' + commentCount);
                console.log('ratelimit remaining: ' + r.ratelimitRemaining);
                if (nextComment == 'ofiegh') {
                    conn.close(); //close the MariaDB connection
                    clearInterval(pushComment); //stop at top comment
                }
                working = false
            } catch (err) {
                console.warn(err);
            }
        }, 1020);
    } catch (err) {
        console.log(err);
    }
}
