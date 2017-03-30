'use strict';

import express from 'express';
import alexa from 'alexa-app';
import config from 'easy-config';
import { launch, pre, post, sessionEnded, error } from './events';
import mergeSkills from './utils/mergeSkills';
import { generateAmazonConfig } from './scripts/generateAmazonConfig';

const express_app = express();
const app = new alexa.app(config.server.accessEndpoint);

// By default, alexa-app will persist every request session attribute into the response.
// This way, any session attributes you set will be sent on every subsequent request,
// as is typical in most web programming environments.
// If you wish to disable this feature, you can do so by setting app.persistentSession to false.
app.persistentSession = true;

mergeSkills(config.locations.skillsLocation)
  .then((skills) => {
    skills.forEach((skill) => {
      skill.intents.forEach((endpoint) => {
        // Remap slots
        let slots = null;
        if (endpoint.slots) {
          slots = {};
          Object.keys(endpoint.slots).forEach((slotName) => {
            const slotProps = endpoint.slots[slotName];
            slots[slotName] = (slotProps && slotProps.type) || slotProps;
          });
        }

        // Define intent function
        app.intent(
          endpoint.intentName,
          {
            slots: slots,
            utterances: endpoint.utterances
          },
          (req, res, next) => {
            return endpoint.response(req, res, next);
          }
        );
      });
    });
    return skills;
  })
  .then((skills) => {
    // setup the alexa app and attach it to express
    app.express({ expressApp: express_app, router: express.Router() });

    app.launch(launch);
    app.pre = pre;
    app.post = post;
    app.sessionEnded(sessionEnded);
    app.error = error;

    express_app.listen(config.server.port, config.server.host, () => {
      // eslint-disable-next-line no-console
      console.log(`Listening to port ${config.server.port}...`);
    });

    if (express_app.settings.env !== 'test') {
      generateAmazonConfig(skills);
    }
  })
  .catch((err) => {
    throw new Error(`Could not find/merge skills: ${err}`);
  });

module.exports = {
  app,
  handler: app.lambda()
};