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
        return res.json({
            "response_type": "ephemeral",
            "text": "Sorry, you are not authorized to use this command"
        });
    }

    if (!text){
        return res.json({
            "response_type": "ephemeral",
            "text": "I know about these NPCs: " + _.keys(avatars).join(', ')
        });
    }

    var parts = text.match(/([@#][^\s]+\s+)?(:.+?:\s+)?(['"]?)(.+?)\3\s+(.+)/);
    if (! parts){
        return res.json({
            "response_type": "ephemeral",
            "text": "Failed; message should be like: /npc #channel NPCName hey what's up?"
        });
    }

    var channel = parts[1];
    var emoji = parts[2];
    var username = parts[4].trim();
    var message = parts[5].trim();

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

    if (emoji){
        doc.icon_emoji = emoji.trim();
    } else if (_.has(avatars, username)){
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
                return res.status(200).end();
            }
       }

    });
});

module.exports = router;
