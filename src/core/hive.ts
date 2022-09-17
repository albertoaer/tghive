import { EventEmitter } from 'events';
import { randomBytes } from 'crypto';
import { DbManager, HiveEvents } from '../models';
import { Document } from 'mongodb';
import { onExit } from '../utils';

export class HiveListenner extends EventEmitter {
    public readonly sessionId: string = randomBytes(12).toString('hex');
    private readonly hiveEvents: HiveEvents = this.db.events;
    private lastTimeStamp: number = Date.now();
    private listenOn: boolean = false;

    constructor(private db: DbManager, listenEvents: boolean, elapseMs: number) {
        super({});
        if (listenEvents) {
            this.listenOn = true;
            const timer = setInterval(async () => {
                try {
                    await this.fetchEvents();
                } catch (_) {
                    clearInterval(timer);
                    this.listenOn = false;
                }
            }, elapseMs);
        }
    }

    get isListenning(): boolean {
        return this.listenOn;
    }

    private async fetchEvents() {
        const events = await this.hiveEvents.retrieve(this.sessionId, this.lastTimeStamp);
        for (const event of events) {
            this.emit(event.topic, event.data);
            if (this.lastTimeStamp < event.timestamp)
                this.lastTimeStamp = event.timestamp;
        }
    }

    async sendEvent(topic: string, data: Document) {
        await this.hiveEvents.insert({
            sessionId: this.sessionId,
            topic,
            data,
            timestamp: Date.now()
        });
    }

    async each(timeMs: number, topic: string, generator: () => Document | undefined) {
        const interval = setInterval(() => {
            const generated = generator();
            if (generated) this.sendEvent(topic, generated);
        }, timeMs);
        onExit(async () => clearInterval(interval));
    }

    async stream(inputTopic: string, operation: (doc: Document) => Document | undefined, outputTopic?: string) {
        this.on(inputTopic, data => {
           const output = operation(data);
           if (output) this.sendEvent(outputTopic || inputTopic, output); 
        });
    }
}