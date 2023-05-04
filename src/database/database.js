import * as SQLite from 'expo-sqlite'
import { ResultSet } from 'expo-sqlite'
import { DEFAULT_QUOTE, TABLES } from '../constants';


class Database {
    /**
    * A database object that allows for general control over the application's database
    * 
    * Internal fields:
    * - instance = Database object used for sending SQL transactions. Is undefined by default
    */
    constructor() {
        this.instance = SQLite.openDatabase("storage.db");
    }

    /**
     * Creates all required tables, if necessary.
     * 
     * @returns {Promise<void>} Resolves when initialization is done
     */
    init() {
        return new Promise(async (resolve, reject) => {
            await Promise.all([
                this.createTable(TABLES.ARTIST,
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    favorite BOOLEAN DEFAULT 0 `
                ),
                this.createTable(TABLES.PLAYLIST,
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL DEFAULT 'Playlist',
                    description TEXT DEFAULT '',
                    coverURI TEXT,
                    favorite BOOLEAN DEFAULT 0 `
                ),
                this.createTable(TABLES.PLAYLIST_CONFIG,
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    orderMap TEXT DEFAULT '[]',
                    isLooping BOOLEAN DEFAULT 0,
                    isShuffling BOOLEAN DEFAULT 0,
                    isReversing BOOLEAN DEFAULT 0,
                    playlistId INTEGER NOT NULL,
                    FOREIGN KEY(playlistId) REFERENCES Playlist(id)`
                ),
                this.createTable(TABLES.TRACK,
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL DEFAULT 'Fara titlu',
                    coverURI TEXT,
                    fileURI TEXT NOT NULL UNIQUE,
                    millis INTEGER NOT NULL DEFAULT 0,
                    favorite BOOLEAN DEFAULT 0,
                    platform TEXT NOT NULL CHECK(platform IN('NONE', 'SPOTIFY', 'SOUNDCLOUD', 'YOUTUBE')) DEFAULT 'NONE',
                    artistId INTEGER NOT NULL,
                    FOREIGN KEY(artistId) REFERENCES Artist(id)`
                ),
                this.createTable(TABLES.TRACK_CONFIG,
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    shuffleWeight REAL NOT NULL DEFAULT 0,
                    loopRepeats INTEGER NOT NULL DEFAULT 1,
                    volumeBoost REAL NOT NULL DEFAULT 0,
                    pitch REAL NOT NULL DEFAULT 0,
                    speed REAL NOT NULL DEFAULT 0,
                    startMillis INTEGER DEFAULT 0,
                    endMillis INTEGER DEFAULT 0,
                    playlistConfigId INTEGER NOT NULL,
                    FOREIGN KEY(playlistConfigId) REFERENCES PlaylistConfig(id)`
                ),
                this.createTable(TABLES.PLAYLIST_CONTENT,
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    playlistId INTEGER NOT NULL,
                    trackId INTEGER NOT NULL,
                    UNIQUE(playlistId, trackId),
                    FOREIGN KEY(playlistId) REFERENCES Playlist(id),
                    FOREIGN KEY(trackId) REFERENCES Track(id)`
                ),
                this.createTable(TABLES.QUEUE,
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    currentIndex INTEGER DEFAULT 0,
                    currentMillis INTEGER DEFAULT 0,
                    playlistConfigId INTEGER DEFAULT -1,
                    FOREIGN KEY(playlistConfigId) REFERENCES PlaylistConfig(id)`
                ),
                this.createTable(TABLES.QUOTE,
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    lastFetch INTEGER NOT NULL DEFAULT 0,
                    quote TEXT DEFAULT "${DEFAULT_QUOTE.CONTENT}",
                    author TEXT DEFAULT "${DEFAULT_QUOTE.AUTHOR}",
                    updateDaily BOOLEAN DEFAULT 0`
                )
            ]).then(() => {
                console.log("");
                console.log("Tables were created successfully!");
                console.log(`Registered tables: ${Array.from(Object.values(TABLES)).join(", ")}`);
                resolve();
            }).catch(error => reject(error));
        });
    }

    /**
     * Drops all tables and creates them back.
     * 
     * @returns {Promise<void>}
     */
    resetAndInit() {
        return new Promise(async (resolve, reject) => {
            await this.dropAll();
            await this.init();
            
            resolve();
        });
    }

    /**
     * Creates a new table in the database, if it doesn't exist already.
     * 
     * @param {string} name Table name
     * @param {string} columns Comma-separated column names with their type and restrictions, foreign keys, etc.
     * 
     * @returns {Promise} The ResultSet on resolve, the error on reject. Prints the error to the console
     */
    async createTable(name, columns) {
        return new Promise(async (resolve, reject) => {
            await this.instance.transaction(async tx => {
                await tx.executeSql(`CREATE TABLE IF NOT EXISTS ${name} (${columns})`, 
                    null, 
                    (txObj, rs) => {
                        resolve(rs);
                    },
                    (txObj, error) => {
                        reject(error);
                    }
                );
            });
        }).catch(error => console.error(error.message));
    }

    /**
     * Performs an SQL query on the database.
     * 
     * @param {string} table Table name, case sensitive
     * @param {string[]} [columns] An array containing the column names. If not specified, all columns will be selected
     * @param {string} [conditions] SQL conditions. If not specified, all rows will be selected for the specified columns
     * @param {any[]} [args] Values to replace placeholders with, if specified in columns and/or conditions
     * 
     * @returns {Promise<any[]>} An array of row objects on resolve, the error on reject. Prints the error to the console
     */
    async selectFrom(table, columns = ["*"], conditions, args = []) {
        const cols = columns == null || columns == [] ? ["*"] : columns.join(", ");
        const conds = conditions ? ` WHERE ${conditions}` : ``;

        return new Promise(async (resolve, reject) => {
            await this.instance.transaction(async tx => {
                await tx.executeSql(`SELECT ${cols} FROM ${table}${conds}`, 
                    args, 
                    (txObj, rs) => resolve(rs.rows._array),
                    (txObj, error) => {
                        reject(error);
                    }
                );
            });
        }).catch(error => console.error(error.message));
    }

    /**
     * Performs an SQL insertion on the database.
     * 
     * @param {string} table Table name, case sensitive
     * @param {object} payload Object containing the column names as keys and their values respectively
     * 
     * @returns {Promise<ResultSet>} The ResultSet on resolve, the error on reject. Prints the error to the console
     */
    async insertInto(table, payload = {}) {
        const keys = Object.keys(payload);
        const values = Object.values(payload);
        const joinedColumns = keys.join(", ");
        const joinedPlaceholders = Array(values.length).fill("?").join(", ");

        return new Promise(async (resolve, reject) => {
            if(keys.length == 0) {
                reject(new Error("SQL insert cannot happen with an empty payload"));
                return;
            }

            await this.instance.transaction(async tx => {
                await tx.executeSql(`INSERT INTO ${table} (${joinedColumns}) VALUES (${joinedPlaceholders})`, 
                    values, 
                    (txObj, rs) => {
                        rs.payload = payload;
                        return resolve(rs);
                    }, 
                    (txObj, error) => {
                        return reject(error);
                    }
                );
            });
        }).catch(error => console.error(error.message));
    }

    /**
     * Performs an SQL insertion on the database, but only if there is no row that
     * meets the specified conditions.
     * 
     * @param {string} table Table name, case sensitive
     * @param {object} payload Object containing the column names as keys and their values respectively
     * @param {string} [conditions] SQL conditions
     * @param {any[]} [args] Values to replace placeholders with, if specified in conditions
     * 
     * @returns {Promise<ResultSet|{exists: false}>} Resolves with the ResultSet and an extra 'exists' truthy property if conditions are met.
     */
    async insertIfNotExists(table, payload={}, conditions, args) {
        return this.existsIn(table, conditions, args)
            .then(() => {
                return Promise.resolve({ exists: false });
            })
            .catch(async () => {
                return this.insertInto(table, payload).then(rs => {
                    rs.exists = true;
                    return rs;
                });
            });
    }

    /**
     * Performs multiple concurrent SQL insertions on the database.
     * 
     * @param {string} table Table name, case sensitive
     * @param {object[]} payloads Array containing objects with the column names as keys and their values respectively
     * 
     * @returns {Promise<ResultSet[]>} All ResultSets for each insert on resolve, the error on reject, if one failed. Prints the error to the console
     */
    insertBulkInto(table, payloads=[{}]) {
        return Promise.all(payloads.map(payload => {
            return this.insertInto(table, payload);
        }));
    }

    /**
     * Performs an SQL update on the database.
     * 
     * @param {string} table Table name, case sensitive
     * @param {string} values A string containing values/placeholders for the columns
     * @param {string} [conditions] SQL conditions. If not specified, all rows all be updated
     * @param {any[]} [args] Values to replace placeholders with, if specified in columns and/or values
     * 
     * @returns {Promise<ResultSet>} The ResultSet on resolve, the error on reject. Prints the error to the console
     */
    async update(table, values, conditions, args=[]) {
        const conds = conditions ? ` WHERE ${conditions}` : ``;

        return new Promise(async (resolve, reject) => {
            await this.instance.transaction(async tx => {
                await tx.executeSql(`UPDATE ${table} SET ${values}${conds}`,
                    args,
                    (txObj, rs) => resolve(rs), 
                    (txObj, error) => {
                        reject(error);
                        console.error(error.message);
                    }
                )
            });
        }).catch(error => console.error(error.message));
    }

    /**
     * Performs an SQL delete on the database.
     * 
     * @param {string} table Table name, case sensitive
     * @param {string} [conditions] SQL conditions. If not specified, all rows will be deleted
     * @param {any[]} [args] Values to replace placeholders with, if specified in conditions
     * 
     * @returns {Promise<ResultSet>} The ResultSet on resolve, the error on reject. Prints the error to the console
     */
    async deleteFrom(table, conditions, args=[]) {
        const conds = conditions ? ` WHERE ${conditions}` : ``;

        return new Promise(async (resolve, reject) => {
            await this.instance.transaction(async tx => {
                await tx.executeSql(`DELETE FROM ${table}${conds}`,
                    args,
                    (txObj, rs) => resolve(rs), 
                    (txObj, error) => {
                        reject(error);
                        console.error(error.message);
                    }
                );
            });
        }).catch(error => console.error(error.message));
    }

    /**
     * Performs any SQL statement on the database.
     * 
     * @param {string} statement SQL statement
     * @param {any[]} args Values to replace placeholders with, if specified in statement
     * 
     * @returns {Promise<ResultSet>} The ResultSet on resolve, the error on reject. Prints the error to the console
     */
    async exec(statement, args=[]) {
        return new Promise(async (resolve, reject) => {
            await this.instance.transaction(async tx => {
                await tx.executeSql(statement, args,
                    (txObj, rs) => resolve(rs), 
                    (txObj, error) => {
                        reject(error);
                        console.error(error.message);
                    }
                );
            });
        }).catch(error => console.error(error.message));
    }

    /**
     * Checks if data following given conditions exists in a table.
     * 
     * @param {string} table Table name
     * @param {string} conditions SQL conditions. Accepts placeholders
     * @param {any[]} [args] Values to replace placeholders with, if specified in conditions
     * 
     * @returns {Promise<void>} Resolves if exists, rejects otherwise
     */
    existsIn(table, conditions, args = []) {
        return new Promise(async (resolve, reject) => {
            await this.selectFrom(table, null, conditions, args).then(rows => {
                if (rows.length > 0) resolve();
                else reject();
            });
        });
    }

    /**
     * Checks if data following given conditions exists in a table, but also returns the rows, if any were found.
     * 
     * @param {string} table Table name
     * @param {string} conditions SQL conditions. Accepts placeholders
     * @param {any[]} [args] Values to replace placeholders with, if specified in conditions
     * 
     * @returns {Promise<any[]>} Resolves or rejects with an object containing the information,
     * depending if it exists or not.
     */
    existsWithRows(table, conditions, args = []) {
        return new Promise(async (resolve, reject) => {
            await this.selectFrom(table, null, conditions, args).then(rows => {
                if (rows.length > 0) resolve(rows);
                else reject(rows);
            });
        });
    }

    /**
     * Drops the specified table.
     * 
     * @param {string} table Table name
     * 
     * @returns {Promise<ResultSet>} Resolves with a ResultSet when done
     */
    drop(table) {
        return this.exec(`DROP TABLE IF EXISTS ${table}`);
    }

    /**
     * Drops all tables in the database.
     * 
     * @returns {Promise<ResultSet[]>} Resolves with an array of ResultSets for each drop when done
     */
    async dropAll() {
        return Promise.all(Array.from(Object.values(TABLES)).map(table => this.drop(table)))
            .catch(error => console.error(error.message));
    }

    /**
     * Clears all data from the table and resets its autoincrement sequence.
     * 
     * This method is preffered over using `Database.deleteFrom` when you want to delete every
     * row and reset the autoincrement sequence at the same time
     * @param {string} table Table name
     * 
     * @returns {Promise<ResultSet>} Resolves with a ResultSet when done
     */
    async truncate(table) {
        return this.deleteFrom(table).then(() => this.resetSequenceFor(table));
    }

    /**
     * Clears all data from the database and resets all autoincrement sequences.
     * 
     * @returns {Promise<ResultSet[]>} Resolves with an array of ResultSets for each truncation when done
     */
    truncateAll() {
        return Promise.all(Array.from(Object.values(TABLES)).map(this.truncate));
    }

    /**
     * Resets the autoincrement sequence for a table.
     * 
     * @param {string} table Table name
     * 
     * @returns {Promise<ResultSet>} Resolves a ResultSet when the sequence was updated
     */
    resetSequenceFor(table) {
        return this.update("sqlite_sequence", "seq = 0", "name = ?", [table]);
    }

    /**
     * Resets all autoincrement sequences for all tables in the database.
     * 
     * @returns {Promise<ResultSet[]>} Resolves with an array of ResultSets for each reset when done
     */
    resetSequenceAll() {
        return Promise.all(Array.from(Object.values(TABLES)).map(this.resetSequenceFor));
    }

    /**
     * Prints all values in a table.
     * 
     * @param {string} table Table name
     */
    valuesOf(table) {
        console.log("");

        this.selectFrom(table).then(rows => {
            if(rows.length == 0) {
                console.log(`No values for ${table}...`);
            } else {
                console.log(`== ${table} ====`);
                for(const row of rows) console.log(`${row.id}: `, row);
            }
        });
        
        console.log("");
    }
}


export default new Database();