import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./tranquility.db');
db.all("SELECT email FROM users", (err, rows) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("ALL EMAILS IN SQLITE DB:");
        rows.forEach(r => console.log(r.email));
    }
    db.close();
});
