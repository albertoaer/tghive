export * from './models';
export * from './core';
export * from './utils';

import TelegramBot from 'node-telegram-bot-api';
import { Behave, HiveBot, HiveListenner } from './core';
import { DbManager } from './models';
import { Config, fillConfig } from './utils';

export interface HiveConfig {
    listenEvents: boolean,
    elapseMs: number
    db: DbManager
}

const defaultHiveConfig = {
    listenEvents: true,
    elapseMs: 100
}

export interface HiveResult {
    db: DbManager;
    hive: HiveListenner;
}

export async function openHive(config: Config<HiveConfig, typeof defaultHiveConfig>): Promise<HiveResult> {
    const {db, listenEvents, elapseMs} = fillConfig(config, defaultHiveConfig);
    return { db: config.db, hive: new HiveListenner(db, listenEvents, elapseMs) };
}

export type HiveBotConfig = HiveConfig & Behave

const defaultHiveBotConfig = {
    keepChats: true,
    keepMessages: false,
    ...defaultHiveConfig
}

export interface HiveBotResult extends HiveResult {
    bot: HiveBot;
    tgBot: TelegramBot;
}

export async function hiveBot(name: string, config: Config<HiveBotConfig, typeof defaultHiveBotConfig>): Promise<HiveBotResult> {
    const filledConfig = fillConfig(config, { ...defaultHiveBotConfig });
    const token = await config.db.bots.tokenOf(name);
    if (!token)
        throw new Error("Bot does not exists");
    const hv = await openHive(config);
    const bot = new HiveBot(token, filledConfig, hv.hive, hv.db);
    return { tgBot: bot.tgBot, bot, ...hv };
}