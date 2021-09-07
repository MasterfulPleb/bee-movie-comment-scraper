'use strict';
const mariadb = require('mariadb');
const snoowrap = require('snoowrap');
const login = require('./login.json');
const r = new snoowrap(login);
const start = 'hbuj3le';                                                    //figure out the ratelimiting

main()

//it doesnt need to be a function i guess but it looks more professional
async function main() {
    let nextComment = start;
    let testLimit = 4;
    /** @type {Promise<mariadb.Connection>} */
    let conn;
    try {
        //connects to MariaDB
        conn = await mariadb.createConnection({
            socketPath: '/var/run/mysqld/mysqld.sock',
            user: 'root',
            database: 'bee_movie'
        });
        conn.query('INSERT INTO comments ' +
                        '(ID,body,author,timestamp,parentID,permalink,edited,OP,awards)' +
                        'VALUES(' + '"ABCD123"' + ',' + '"G"' + ',' + '"Krosis27"' + ',' +
                        1234567890 + ',' + '"ABCD123"' + ',' + '"/R/OUIJASHIT"' + ',' +
                        false + ',' + false + ',' + 0 + ');'
                    );
        //the meat of the script
        //goes up the chain adding every comment in the main thread to the DB
        /*while (nextComment != undefined) {                                  //figure out what 'parent_id' looks like on the top level comment
            r.getComment(nextComment).fetch()
                .then((conn, c) => {
                    //pushCommentToDB(conn, c);
                    conn.query('INSERT INTO comments ' +
                        '(ID,body,author,timestamp,parentID,permalink,edited,OP,awards)' +
                        'VALUES(' + c.id + ',' + c.body + ',' + c.author.name + ',' +
                        c.created_utc + ',' + c.parent_id + ',' + c.permalink + ',' +
                        c.edited + ',' + c.is_submitter + ',' + c.total_awards_received + ');'
                    );
                    nextComment = c.parent_id.slice(3);
                });
            testLimit--;
            if (testLimit <= 0) break
        }*/
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