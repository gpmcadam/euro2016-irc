# Euro 2016 IRC Bot [![Build Status](https://snap-ci.com/gpmcadam/euro2016-irc/branch/master/build_image)](https://snap-ci.com/gpmcadam/euro2016-irc/branch/master)

This is a custom Euro 2016 IRC Bot. It has a very specific scope, and may not
be easily adapted.

## Forking/Extending

If you want to deploy your own version of this bot, you'll need a `.env` file (or the following environment variables set.)

    IRC_PORT=6667
    IRC_SERVER=irc.example.org
    IRC_CHANNELS=channel1,channel2
    IRC_NICK=Euro2016
    IRC_NAME=Euro2016
    IRC_REALNAME="Euro2016 Bot"
    EURO2016_API_KEY=abc1234
    
    # nickserv password (see the identification section in `index.js`
    # to adapt to your network specific identification service)
    IRC_PASSWORD=test
    
    # the following env vars are for alerting/monitoring and are optional
    # the alerting system uses Amazon SNS, so you'll need to configure
    # an SNS topic, subscribe to it and set the ARN of the topic below
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_REGION=
    SNS_ALERT_TOPIC_ARN=
