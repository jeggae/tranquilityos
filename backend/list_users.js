import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./tranquility.db');
db.all("SELECT id, first_name, last_name, email FROM users", (err, rows) => {
    if (err) {
        console.error("Database error:", err.message);
    } else {
        console.log("REGISTERED ACCOUNTS:");
        rows.forEach(row => {
            console.log(`- ${row.first_name} ${row.last_name} (${row.email})`);
        });
    }
    db.close();
});
