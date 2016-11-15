'use strict';
var express = require('express');
var Slack = require('node-slackr');
var _ = require('underscore');
var fs = require('fs');

var router = express.Router();

var TOKEN = process.env.INCOMING_SLACK_TOKEN;
var slack = new Slack(process.env.INCOMING_SLACK_WEBHOOK);

/* GET home page. */
router.post('/', function(req, res, next) {
    var text = req.body.text;
    var token = req.body.token;
    var user_name = req.body.user_name;

    if (token !== TOKEN){
        return req.json({
            "response_type": "ephemeral",
            "text": "Invalid Command Token"
        });
    }

    var parts = text.match(/([@#][^\s]+)\s+(['"]?)(.+?)\2\s+(.+)/);
    if (! parts){
        return req.json({
            "response_type": "ephemeral",
            "text": "Failed; message should be like: /npc #channel NPCName hey what's up?"
        });
    }

    var channel = parts[1];
    var user = parts[3];
    var message = parts[4];

    slack.notify({
        text: message,
        username: user,
        channel: channel
    }, function(err){
        if (err){
           return req.json({
                "response_type": "ephemeral",
                "text": "Error sending message: " + err
            });
       } else {
            return req.json({
                "response_type": "ephemeral",
                "text": "Sent message to " + channel + ' as ' + user
            });
       }

    });
});

module.exports = router;
