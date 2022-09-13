# Telegram Hive

The telegram hive library allows saving state and memorization for telegram bots besides real-time message passing through events to provide communication between multiple bots.

The hive is implemented in [MongoDB](https://github.com/mongodb/mongo) and the bot uses the [telegram bot api](https://core.telegram.org/bots/api) through the [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) library

# API

The tgHive API provides two main methods, one for starting just a communication gateway with the whole hive, another one that also instantiates a bot.

```ts
const { hive, db } = openHive({ db: ... }); 

const { bot, hive, db } = hiveBot(botName, { db: ... });
//                                ↑ the name of the bot stored at the DB
```

The DB input in the configuration is not the one at the output. The input one is a MongoDB Database, the returned one a instance with the models created as collections inside mongo database.