const AWS = require('aws-sdk');

module.exports = (subject, message) => {
    if (!process.env.SNS_ALERT_TOPIC_ARN) {
        return false;
    }
    const sns = new AWS.SNS();
    sns.publish({
        Subject: subject,
        TopicArn: process.env.SNS_ALERT_TOPIC_ARN,
        Message: message
    });
};
