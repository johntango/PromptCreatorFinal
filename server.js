import express from 'express';
import path from 'path';
const app = express();
const port = 3031;
import fs from 'fs';
import OpenAI from 'openai' ;
import bodyParser from 'body-parser'   // really important otherwise the body of the request is empty
app.use(bodyParser.urlencoded({ extended: false }));
// get OPENAI API key from GitHub secrets
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// get OPENAI_API_KEY from GitHub secrets uncomment the following lines


// get the API key from the json file
var openai= null;
fs.readFile('openai_key.json', (err, data) => {
  // change the data to a json object and assign it to the openai variable
  data = JSON.parse(data);
  // get the api key from the json object
  let key = data.apiKey;
  console.log("data:"+data)
  console.log(key)
  openai = new OpenAI({apiKey: key});
});




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

// specify root directory for static files for ES6 modules
const __dirname = path.resolve();
app.use(express.static(__dirname));



// Serve popup.html at the root URL '/'
app.get('/', (req, res) => {
  // get full path to popup.html
  const filePath = path.join(__dirname, 'popup.html');
    res.sendFile(filePath);
})

app.post('/prompt', async(req, res) => {
  // get the values from the request 
  console.log(JSON.stringify(req.body));
  const topic = req.body.topic;
  const style = req.body.style;
  const tone = req.body.tone;
  const language = req.body.language;
  console.log("topic: " + topic)

  try {
    let prompt = "Write aproximately 100 word article on this topic: " + topic + " using this sentiment: " + sentiment;

    let completion = await client.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: prompt
      }
    )
    res.send(completion.choices[0])
    console.log("chatResponse: " + completion.choices[0].text); 
} catch (error) {
      console.error('Error:', error);
}
});
 
    
// Test API key
app.get('/test-key', async (req, res) => {
  console.log("test-key")
  try {
    console.log("in test-key:" + client.apiKey)
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
