# slack-npc
A Slack bot, designed to run on Heroku, that provides the /npc command for running NPCs

## Usage
`/npc` - Display a list of NPCs that have set avatars

`/npc [#channel] [:emoji:] <Name> <Message>` - send message as name (surround with quotes for multi-word names) to channel (current channel if unspecified), using the optional emoji as the user icon, or the defined user icon for that name

## Customization
### Whitelist
Update data/users.json to set who can use the application.  The file must be a valid JSON array

### Avatars
Update data/avatars.json to set avatars, either URL or Emoji, for known NPCs.  Any NPC message that uses a name from that list, and does not specify an emoji as part of the command, will use the value specified here for its avatar.  The file must me a valid JSON object

## Installation

Clone this repository, create a new heroku app
```
$ git clone git@github.com:dkapell/slack-npc.git
$ cd slack-npc
$ heroku apps:create [appname]
```

In Slack integrations, add a Slash command with the following settings:

Field | Value
--- | ---
Command | /npc
URL | https://&lt;appname&gt;.herokuapp.com
Method | POST
Customize Name | npc
Customze Icon | :speech-bubble:
Autocomplete Help text &gt;  Description | Posts as an NPC to a channel
Autocomplete Help text &gt;  Usage Hint | [#channel] [:emoji:] &lt;username&gt; &lt;message&gt;

Save the generated Token as a Heroku environment variable:
    `heroku config:set INCOMING_SLACK_TOKEN=XXX`

In Slack Integrations, add an Incoming WebHook, setting the default icon to what you would like, and save the Webhook URL as an Heroku environment variable:
``` 
$ heroku config:set INCOMING_SLACK_WEBHOOK=https://hooks.slack.com/services/BLAH/BLAH/BLAH
```

Deploy to heroku.
```
$ git push heroku master
```
