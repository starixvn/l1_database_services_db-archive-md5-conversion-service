import type { BaseLogger } from "@ldb/logger";
import type { AnyBulkWriteOperation, ChangeStreamNameSpace, Collection, Document, MongoClient } from "@ldb/mongo";
import { Binary } from "@ldb/mongo";
import { Subscriber } from "@ldb/utils";
import type { MD5Initiator, MD5InitiatorEvents } from "../initiators/md5-initiator.js";
import type { MD5Configs } from "../types/md5-configs.js";
import { dotNotation, filterStringValue, isEmpty } from "./converter-utils.js";

export class MD5Converter extends Subscriber<MD5InitiatorEvents> {
    private readonly flags: Map<string, Date> = new Map();

    constructor(
        private readonly mongo: MongoClient,
        logger: BaseLogger,
    ) {
        super(logger);
        this.selfBound();
    }

    private selfBound() {
        this.execute = this.execute.bind(this);
    }

    private async execute(config: MD5Configs) {
        const { _id, fields } = config;
        const collection = this.getCollection(_id);

        const flag = collection.namespace;
        const flagValue = this.flags.get(flag);

        if (flagValue) {
            this.logger.logInfo({ title: this.className, message: `${flag} is running since ${flagValue.toISOString()}` });
            return;
        }

        try {
            this.flags.set(flag, new Date());
            await this.convertFieldsToMD5(collection, fields);
            this.logger.logInfo({ title: `${this.className}.execute`, message: "MD5 conversion completed" }, { extra: { collection: flag } });
        } catch (error) {
            this.logger.logError({ title: `${this.className}.execute`, message: error });
        } finally {
            this.flags.delete(flag);
        }
    }

    private async convertFieldsToMD5(collection: Collection, fields: string[]) {
        const filter = { $or: fields.map(filterStringValue) };

        let bulkOps: Extract<AnyBulkWriteOperation, { updateOne: unknown }>[] = [];

        for await (const document of collection.find(filter)) {
            const { _id } = document;

            const converted: Document = {};

            for (const field of fields) {
                const value = dotNotation(document, field);

                if (value == null) {
                    continue;
                }

                if (typeof value !== "string") {
                    continue;
                }

                if (!/([0-9a-f][0-9a-f])*/.test(value)) {
                    continue;
                }

                const binData = new Binary(Buffer.from(value, "hex"), 5);
                if (binData.toString("hex") === value) {
                    converted[`${field}`] = binData;
                }
            }

            if (isEmpty(document)) {
                continue;
            }

            bulkOps.push({
                updateOne: {
                    filter: { _id },
                    update: { $set: converted },
                },
            });

            if (bulkOps.length >= 1_000) {
                try {
                    const { insertedCount, matchedCount, modifiedCount, deletedCount, upsertedCount } = await collection.bulkWrite(bulkOps, { ordered: false });
                    this.logger.logDebug(
                        { title: `${this.className}.convertFieldsToMD5`, message: "" },
                        { extra: { collection: collection.namespace, insertedCount, matchedCount, modifiedCount, deletedCount, upsertedCount } },
                    );
                } catch (error) {
                    this.logger.logError({ title: `${this.className}.convertFieldsToMD5`, message: error }, { extra: { collection: collection.namespace } });
                }
                bulkOps = [];
            }
        }
        if (bulkOps.length > 0) {
            try {
                const { insertedCount, matchedCount, modifiedCount, deletedCount, upsertedCount } = await collection.bulkWrite(bulkOps, { ordered: false });
                this.logger.logDebug(
                    { title: `${this.className}.convertFieldsToMD5`, message: "" },
                    { extra: { collection: collection.namespace, insertedCount, matchedCount, modifiedCount, deletedCount, upsertedCount } },
                );
            } catch (error) {
                this.logger.logError({ title: `${this.className}.convertFieldsToMD5`, message: error }, { extra: { collection: collection.namespace } });
            }
        }
    }

    private getCollection<T extends Document>(namespace: ChangeStreamNameSpace) {
        const { db, coll } = namespace;
        return this.mongo.db(db).collection<T>(coll);
    }

    subscribe(publisher: MD5Initiator) {
        return super.subscribe(publisher, "INITIATE", this.execute);
    }

    unsubscribe(publisher: MD5Initiator) {
        return super.unsubscribe(publisher, "INITIATE", this.execute);
    }
}
