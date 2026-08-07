import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./tranquility.db');

console.log("Applying SQLite Patch for Auth Reset Token Logic...");

db.run(`ALTER TABLE users ADD COLUMN reset_token TEXT;`, (err1) => {
    if(err1 && !err1.message.includes('duplicate column')) console.error("Error patching reset_token:", err1.message);
    
    db.run(`ALTER TABLE users ADD COLUMN reset_expires DATETIME;`, (err2) => {
         if(err2 && !err2.message.includes('duplicate column')) console.error("Error patching reset_expires:", err2.message);
         console.log("Migration Complete! Reset columns locked dynamically.");
         db.close();
    });
});
