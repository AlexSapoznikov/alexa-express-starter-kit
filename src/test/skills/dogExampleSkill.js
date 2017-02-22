'use strict';

export default {
  skillName: 'dog',
  invocationName: 'dog',
  intents: [
    {
      intentName: 'dogNumber',
      slots: {
        number: 'AMAZON.NUMBER'
      },
      utterances: [
        'say the number {-|number}',
        'find {-|number}'
      ],
      response: (request, response) => {
        const number = request.slot('number');
        response.say(`The number you asked to say is ${number}`);
      }
    },
    {
      intentName: 'dogFood',
      slots: null,
      utterances: [
        'give {him|her} food',
        '{she|he} {wants|needs} food'
      ],
      response: (request, response) => {
        response.say('Yes, much food, such wow');
      }
    }
  ]
};