'use strict';
const mariadb = require('mariadb');
const snoowrap = require('snoowrap');
const login = require('./login.json');
const r = new snoowrap(login);
const start = 'hbuj3le';                                                    //figure out the ratelimiting

main()

//it doesnt need to be a function i guess but it looks more professional
async function main() {
    var nextComment = start;
    var testLimit = 5;
    /** @type {Promise<mariadb.Connection>} */
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
        while (nextComment != undefined) {                                  //figure out what 'parent_id' looks like on the top level comment
            //get next comment
            var c = await r.getComment(nextComment).fetch();
            //push comment to DB
            console.log(c);
            conn.query('INSERT INTO comments ' +
                '(ID,body,author,timestamp,parentID,permalink,edited,OP,awards)' +
                'VALUES("' + c.id + '","' + c.body + '","' + c.author.name + '",' +
                c.created_utc + ',"' + c.parent_id.slice(3) + '","' + c.permalink + '",' +
                c.edited + ',' + c.is_submitter + ',' + c.total_awards_received + ');'
            );
            nextComment = c.parent_id.slice(3);
            testLimit--;
            if (testLimit <= 0) break
        }
    } catch (err) {
        //error handling
        console.log(err);
    } finally {
        //close the MariaDB connection
        if (conn) conn.close();
    }
}
//pushes relevant pieces of data to the DB
function pushCommentToDB(conn, c) {
    return conn.query('INSERT INTO comments ' +
        '(ID,body,author,timestamp,parentID,permalink,edited,OP,awards)' +
        'VALUES(' + c.id + ',' + c.body + ',' + c.author.name + ',' +
        c.created_utc + ',' + c.parent_id + ',' + c.permalink + ',' +
        c.edited + ',' + c.is_submitter + ',' + c.total_awards_received + ');'
    );
}