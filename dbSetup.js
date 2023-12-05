// Import the sqlite3 module and enable verbose for detailed stack trace
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { create } from 'domain';
import { get } from 'http';
// specify root directory for static files for ES6 modules
const __dirname = path.resolve();
const dbPath = path.join(__dirname, 'data', 'prompts.db');
const dbDir = path.dirname(dbPath);

function createSubDir(dirPath) {
    // Ensure the 'data' directory exists
    if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    }
}

function createTable(db) {
    // Create the prompts table if it does not exist
    db.serialize(() => {
        db.run(`CREATE TABLE prompts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            sentiment TEXT NOT NULL,
            style TEXT NOT NULL,
            tone TEXT NOT NULL,
            language TEXT NOT NULL,
            prompt TEXT NOT NULL,
            response TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('create table error'+err.message);
            }
        });
    }
    );
}
function insertIntoTable(db) {
    db.run(`
    INSERT INTO prompts (topic, sentiment, style, tone, language, prompt, response) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
`, ['test', 'test', 'test', 'test', 'test', 'test', 'test'], function(err) {
    if (err) {
        return console.error("Error inserting data:", err.message);
    }
    console.log(`Row inserted with ID: ${this.lastID}`);
});
}

// creat the database
function getDB(dbPath) {
    let db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error("Error connecting to the database:", err.message);
            reject(err);
        }
        console.log("Connected to the prompts database.");
    });
    return db;
}
// create the database and then create the table and then insert data
// creat the subdirectory if it does not exist
createSubDir(dbDir);
const db = getDB(dbPath)
createTable(db)
insertIntoTable(db)

