import TelegramBot from "node-telegram-bot-api";
import { DbManager } from "../models";
import { onExit } from "../utils";
import { HiveListenner } from "./hive";

export interface Behave {
    keepMessages: boolean,
    keepChats: boolean
}

export function getTgBot(token: string, behave: Behave, db: DbManager): TelegramBot {
    const tg = new TelegramBot(token, { polling: true });

    if (behave.keepChats) tg.on('message', msg => db.chats.saveOrUpdate(msg.chat, 'chatId'));
    if (behave.keepMessages) tg.on('message', msg => db.messages.save(msg));

    onExit(async () => {
        await tg.stopPolling();
        await tg.close();
    });

    return tg;
}

export class HiveBot {
    public readonly tgBot: TelegramBot = getTgBot(this.token, this.behave, this.db);

    constructor(
        protected token: string,
        protected behave: Behave,
        protected hive: HiveListenner,
        protected db: DbManager
    ) {
        
    }
}