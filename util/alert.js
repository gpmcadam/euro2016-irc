const AWS = require('aws-sdk');
const sns = new AWS.SNS();

module.exports = (subject, message) => {
    if (!process.env.SNS_ALERT_TOPIC_ARN) {
        return false;
    }
    sns.publish({
        Subject: subject,
        TopicArn: process.env.SNS_ALERT_TOPIC_ARN,
        Message: message
    });
};
