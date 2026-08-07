import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./tranquility.db');

console.log("Applying SQLite Patch for Business Branding Options...");

db.run(`ALTER TABLE businesses ADD COLUMN logo_url TEXT;`, (err) => {
    if(err && err.message.includes('duplicate column name')) {
       console.log("Migration Skipped: Column logo_url already exists.");
    } else if (err) {
       console.error("Migration Failed:", err.message);
    } else {
       console.log("Migration Successful! logo_url column patched completely.");
    }
    db.close();
});
