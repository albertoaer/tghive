import { Bots } from './bots';
import { Chats } from './chats';
import { Messages } from './messages';
import { Db } from 'mongodb';
import { HiveEvents } from './events';

export class DbManager {
    public readonly bots: Bots = new Bots(this.db.collection('bots'));
    public readonly chats: Chats = new Chats(this.db.collection('chats'));
    public readonly messages: Messages = new Messages(this.db.collection('messages'));
    public readonly events: HiveEvents = new HiveEvents(this.db.collection('events'));

    constructor(protected db: Db) {}
}

export { Bots, Chats, Messages, HiveEvents };