const Slack = require('slack-node');

const webhookUri = 'https://hooks.slack.com/services/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';

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
