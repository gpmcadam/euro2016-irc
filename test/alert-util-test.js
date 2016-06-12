const assert = require('chai').assert;
const AWS = require('aws-sdk-mock');
const alert = require('../util/alert');

describe('Alert Util', () => {
    it('should alert if aws key is present', () => {
        process.env.SNS_ALERT_TOPIC_ARN = 'foo';
        process.env.AWS_ACCESS_KEY_ID = 'bar';
        process.env.AWS_SECRET_ACCESS_KEY = 'baz';
        process.env.AWS_REGION = 'us-west-2';
        const mock = AWS.mock('SNS', 'publish');
        alert('foo', 'bar');
        assert.deepEqual(mock.stub.getCall(0).args[0], { TopicArn: process.env.SNS_ALERT_TOPIC_ARN, Message: 'bar', Subject: 'foo' });
    });
    it('should not alert if no aws key', () => {
        delete process.env.SNS_ALERT_TOPIC_ARN;
        assert.isFalse(alert('foo', 'bar'));
    });
});
