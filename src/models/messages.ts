import { Message } from "node-telegram-bot-api";
import { SavableModel } from "./common";

export interface DbMessage {
    id: number;
    chatId: number;
    userId?: number;
    date: number;
    content: any;
}

export class Messages extends SavableModel<DbMessage, Message> {
    convert(message: Message): DbMessage {
        const clone: any = Object.assign({}, message);
        delete clone['message_id'];
        delete clone['chat'];
        delete clone['from'];
        delete clone['date'];
        return {
            id: message.message_id,
            chatId: message.chat.id,
            userId: message.from?.id,
            date: message.date,
            content: clone
        };
    }
}