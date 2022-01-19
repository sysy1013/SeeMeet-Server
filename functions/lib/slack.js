const Slack = require('slack-node');
const dotenv = require('dotenv');

dotenv.config();
const webhookUri = process.env.SLACK_TOKEN;

const slack = new Slack();
slack.setWebhook(webhookUri);

const send = async (message) => {
  slack.webhook(
    {
      text: `${message}`,
    },
    function (err, response) {
      console.log(response);
    },
  );
};

module.exports = { send };
