'use strict';
var express = require('express');
var Slack = require('node-slackr');
var _ = require('underscore');
var fs = require('fs');

var router = express.Router();

var TOKEN = process.env.INCOMING_SLACK_TOKEN;

var slack = new Slack(process.env.INCOMING_SLACK_WEBHOOK);


var users = JSON.parse(fs.readFileSync(__dirname + '/../data/users.json'));
var avatars = JSON.parse(fs.readFileSync(__dirname + '/../data/avatars.json'));

/* GET home page. */
router.post('/', function(req, res, next) {
    var text = req.body.text;
    var token = req.body.token;
    var user = req.body.user_name;

    if (token !== TOKEN){
        return res.json({
            "response_type": "ephemeral",
            "text": "Invalid Command Token"
        });
    }

    if (_.indexOf(users, user) === -1){
        console.log('user ' + user + ' unauthorized');
    } else {
        console.log('user ' + user + ' authorized');
    }

    var parts = text.match(/([@#][^\s]+\s+)?(['"]?)(.+?)\2\s+(.+)/);
    if (! parts){
        return res.json({
            "response_type": "ephemeral",
            "text": "Failed; message should be like: /npc #channel NPCName hey what's up?"
        });
    }

    var channel = parts[1];
    var username = parts[3];
    var message = parts[4];

    var response = true;

    if (!channel){
        channel = req.body.channel_name;
        response = false;
    }

    var doc = {
        text: message,
        username: username,
        channel: channel.trim()
    };

    if (_.has(avatars, username)){
        if (avatars[username].type ==="url" ){
            doc.icon_url = avatars[username].path;
        } else if (avatars[username].type ==="emoji" ){
            doc.icon_emoji = avatars[username].icon;
        }
    }

    slack.notify(doc, function(err){
        if (err){
           return res.json({
                "response_type": "ephemeral",
                "text": "Error sending message: " + err
            });
       } else {
            if (response){
                return res.json({
                    "response_type": "ephemeral",
                    "text": "Sent message to " + channel + ' as ' + username
                });
            } else {
                return res.json({});
            }
       }

    });
});

module.exports = router;
