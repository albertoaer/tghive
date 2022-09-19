import TelegramBot, {  Message } from "node-telegram-bot-api";
import { DbManager } from "../models";
import { DbChat } from "../models/chats";
import { onExit } from "../utils";
import { HiveListenner } from "./hive";
import { MessageData } from "./messaging";

export interface Behave {
    keepMessages: boolean;
}

export function getTgBot(token: string, behave: Behave, db: DbManager): TelegramBot {
    const tg = new TelegramBot(token, { polling: true });

    tg.on('message', async msg => {
        await db.chats.saveOrUpdate(msg.chat, 'id');
        await db.chats.includeBot({id: msg.chat.id}, token)
    });
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

    async chat(id: number | string): Promise<DbChat | null> {
        return this.db.chats.find({[typeof id === 'number' ? "id" : "alias"]: id})
    }

    async msg(maker: (tgBot: TelegramBot, to: number) => Promise<Message>, to: number | string) {
        const chat = await this.chat(to);
        if (chat) {
            try {
                await maker(this.tgBot, chat.id);
                if (!chat.knownBots.includes(this.token))
                    this.db.chats.includeBot({id: chat.id}, this.token);
            } catch (_) {}
        }
    }

    async send(data: MessageData, to: number | string) {
        await this.msg(data.send.bind(data), to);
    }
}