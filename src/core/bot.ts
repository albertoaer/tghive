import TelegramBot, { Message } from "node-telegram-bot-api";
import { EventEmitter } from 'events';
import { DbManager } from "../models";
import { DbChat } from "../models/chats";
import { DbMessage } from "../models/messages";
import { escapeRegExp, onExit } from "../utils";
import { HiveListenner } from "./hive";
import { MessageData } from "./messaging";

export interface Behave {
    keepMessages: boolean;
    commands: [string, string][];
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

export declare interface HiveBot {
    on(event: 'message', listener: (input: DbMessage) => void): this;
    on(event: 'command', listener: (cmd: string, input: DbMessage) => void): this;
}

export class CommandsError extends Error {
    constructor() {
        super('Error setting the commands');
    }
}

export class HiveBot extends EventEmitter {
    public readonly tgBot: TelegramBot = getTgBot(this.token, this.behave, this.db);

    constructor(
        protected token: string,
        protected behave: Behave,
        protected hive: HiveListenner,
        protected db: DbManager
    ) {
        super({});
        this.tgBot.addListener('message', msg => this.emit('message', db.messages.convert(msg)));
        const commandMatch = new RegExp('/(' + this.behave.commands.map(b => escapeRegExp(b[0])).join('|') + ')( (.*))?');
        const commandNameMatch = new RegExp('(' + this.behave.commands.map(b => escapeRegExp(b[0])).join('|') + ')');

        this.tgBot.setMyCommands(behave.commands.map(c => {
            return { command: c[0], description: c[1] }
        }), {scope: { type: "default" }}).then(success => {
            if (!success) throw new CommandsError();
            if (this.behave.commands)
                this.tgBot.onText(commandMatch, (msg, match) =>
                    this.emit('command', commandNameMatch.exec(match?.[0] as string)?.[0] as string, db.messages.convert(msg))
                );
        });
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