import TelegramBot, { Message } from "node-telegram-bot-api";

export interface MessageData {
    send(bot: TelegramBot, chatId: number): Promise<Message>;
}

abstract class TgMessageWrapper<T> implements MessageData {
    protected abstract fn: (chatId: number, data: T) => Promise<any>
    
    constructor(public data: T) {}

    async send(bot: TelegramBot, chatId: number): Promise<Message> {
        return await this.fn.call(bot, chatId, this.data);
    }
}

export class Text extends TgMessageWrapper<string> {
    fn = TelegramBot.prototype.sendMessage;
}

export class Photo extends TgMessageWrapper<string | Buffer> {
    fn = TelegramBot.prototype.sendPhoto;
}

export class Video extends TgMessageWrapper<string | Buffer> {
    fn = TelegramBot.prototype.sendVideo;
}

export class VideoNote extends TgMessageWrapper<string | Buffer> {
    fn = TelegramBot.prototype.sendVideoNote;
}

export class Dice extends TgMessageWrapper<undefined> {
    fn = TelegramBot.prototype.sendDice;

    constructor() {
        super(undefined);
    }
}