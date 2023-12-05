import express from 'express';
import path from 'path';
const app = express();
const port = 3031;
import fs from 'fs';
import OpenAI from 'openai' ;
import bodyParser from 'body-parser'   // really important otherwise the body of the request is empty
import sqlite3 from 'sqlite3';
import mustacheExpress from 'mustache-express';

// specify root directory for static files for ES6 modules
const __dirname = path.resolve();
app.use(express.static(__dirname));

// Use Mustache as the template engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

// connect to db and get cursor
// Example usage:
const dbPath = 'data/prompts.db';
const db = getConnection(dbPath);


// get OPENAI API key from GitHub secrets
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// use below if runnning locally and not using GitHub secrets
async function getKey(){

  fs.readFile('openai_key.json', (err, data) => {
    // change the data to a json object and assign it to the openai variable
    data = JSON.parse(data);
    // get the api key from the json object
    let key = data.apiKey;
    console.log(key)
    let client = new OpenAI({apiKey: key});
    return client;
  });
}
const client = new OpenAI({apiKey: OPENAI_API_KEY});

// Middleware to parse JSON payloads in POST requests
app.use(express.json());

// Serve popup.html at the root URL '/'
app.get('/', (req, res) => {
  // get full path to popup.html
  const filePath = path.join(__dirname, 'popup.html');
    res.sendFile(filePath);
})

app.get('/table', (req, res) => {
  const sql = "SELECT * FROM prompts";
  db.all(sql, [], (err, rows) => {
      if (err) {
          throw err;
      }
      rows.forEach((row) => {
          console.log(row);
      });
      res.render('table', { rows });
  });
});

app.post('/test-prompt', async(req, res) => {
  // get full path to popup.html
  console.log("Action: "+ JSON.stringify(req.body));
  let topic = req.body.prompt;
  let sentiment = req.body.sentiment;
  let style = "Informative";
  let tone = "Neutral";
  let language = "English";
  let chatResponse = "No response";
  try {
    let prompt = "Write aproximately 100 word article on this topic: " + topic + " using this sentiment: " + sentiment;

    let completion = await client.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: prompt
      }
    )
    chatResponse = completion.choices[0].text;
    console.log("chatResponse: " + chatResponse);
    // send response text back to client
    let data = {topic, sentiment, style, tone, language, prompt, response:chatResponse};
    insertIntoTable(db, data);
    res.send(chatResponse);
} catch (error) {
      console.error('Error:', error);
}
});
 
    
// Test API key
app.get('/test-key', async (req, res) => {
  console.log("test-key")
  try {
    console.log("in test-key:" + openai.apiKey)
    let prompt = "Say hello world in French";
    let completion = await client.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: prompt
      }
    )
    console.log(completion.choices[0].text);
    console.log("test-key response sent")
    res.send(completion.choices[0].text);
        
  } catch (error) {
      return console.error('Error:', error);
  }
});

//this is where we write to the database
function insertIntoTable(db, data) {
  const sql = `
      INSERT INTO prompts (topic, sentiment, style, tone, language, prompt, response) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [data.topic, data.sentiment, data.style, data.tone, data.language, data.prompt, data.response], function(err) {
      if (err) {
          return console.error("Error inserting data:", err.message);
      }
      console.log(`Row inserted with ID: ${this.lastID}`);
  });
}

function getConnection(dbPath) {
  return new sqlite3.Database(dbPath, (err) => {
      if (err) {
          console.error("Error connecting to the database:", err.message);
      } else {
          console.log("Connected to the SQLite database.");
      }
  });
}


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

