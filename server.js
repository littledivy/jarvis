const Spring = require("js-spring");
const Torpedo = require("torpedo.js");
const path = require("path");
const dialogflow = require("dialogflow");
const uuid = require('uuid');
const dotenv = require("dotenv");

dotenv.config();

var { app, socket } = new Spring({ name: "jarvis" });
var { get, post } = new Torpedo(app);

/**
 * serve main bot page
 **/

get('/api/:msg').do((req, res, next) => {
	bot(req.params.msg, (result) => {
		res.status(200).send(result);
	});
});

get('/').sendFile(path.join(__dirname, 'index.html'));

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function bot(text, cb) {
  // A unique identifier for the given session
  const sessionId = uuid.v4();
  const projectId = 'leaflet-123';
  // Create a new session
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);
 
  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: text,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };
 
  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  cb(result.fulfillmentText);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
};

