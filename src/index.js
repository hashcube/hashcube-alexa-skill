/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';
var DATA = require('./data');
var _ = require('./underscore');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * HashcubeSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HashcubeSkill = function() {
    AlexaSkill.call(this, APP_ID);
};


// Extend AlexaSkill
HashcubeSkill.prototype = Object.create(AlexaSkill.prototype);
HashcubeSkill.prototype.constructor = HashcubeSkill;

HashcubeSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("HashcubeSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    session.attributes = {
      id: 0
    };
    // any session init logic would go here
};

HashcubeSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("HashcubeSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

HashcubeSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

HashcubeSkill.prototype.intentHandlers = {

    "GetFirstEventIntent": function (intent, session, response) {
        handleFirstEventRequest(intent, session, response);
    },

    "GetNextEventIntent": function (intent, session, response) {
        handleFirstEventRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "I don't help.";
        var repromptText = "help";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "No o o o o o o!",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "No o o o o o o!",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    }
};

/**
 * Function to handle the onLaunch skill behavior
 */

function getWelcomeResponse(response) {
    var cardTitle = "hashcube card title";
    var repromptText = "reprompt text";
    var speechText = "<p>Hello.</p> <p>Welcome to Hashcube. Who should I talk about?</p>";
    var cardOutput = "Card output";

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
function handleFirstEventRequest(intent, session, response) {
    var nameSlot = intent.slots.Name;
    var repromptText = "I'm waiting...";
    var cardTitle = "Card title";
    var cardContent = "Card content";
    var name = nameSlot && nameSlot.value || "";

    console.log('handleFirstEventRequest: ' + name);

    getJsonData(name.toLowerCase(), session, function (val) {
        console.log('got json');
        if (val.length === 0) {
            val = "I don't know that person";
        }

        var speechText = "<p>" + val + ".</p> <p>Who's next?</p>";
        var speechOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        console.log('handleFirstEventRequest: out - ' + speechText);
        response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
    });
}

function getNext(a, id) {
  return id % a.length;
}

function getJsonData(name, session, eventCallback) {
  var list = _.find(DATA, function(person) {
    return _.contains(person.name, name);
  });

  var id = session.attributes.id;
  var data = "";

  if (list && list.about) {
    id = getNext(list.about, id);
    data = list.about[id];
  }

  session.attributes.id = id + 1;
  eventCallback(data);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Hashcube Skill.
    var skill = new HashcubeSkill();
    skill.execute(event, context);
};

