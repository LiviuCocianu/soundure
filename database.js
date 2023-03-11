import * as SQLite from 'expo-sqlite'
import { ResultSet } from 'expo-sqlite'

export default class Database {
    /**
    * A database object that allows for general control over the application's database
    */
    constructor() {
        this.instance = undefined;
        this.TABLES = new Set();
    }

    /**
     * Opens the database and creates all required tables, if necessary
     * @returns {Promise} Resolves when initialization is done
     */
    init() {
        return new Promise(async (resolve, reject) => {
            this.instance = SQLite.openDatabase("storage.db");

            await Promise.all([
                this.createTable("Artist",
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    favorite BOOLEAN DEFAULT 0`
                ),
                this.createTable("Playlist",
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL DEFAULT 'Fara titlu',
                    description TEXT DEFAULT '',
                    coverURI TEXT,
                    favorite BOOLEAN DEFAULT 0`
                ),
                this.createTable("PlaylistConfig",
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    isLooping BOOLEAN DEFAULT 0,
                    isShuffling BOOLEAN DEFAULT 0,
                    isReversing BOOLEAN DEFAULT 0,
                    playlistId INTEGER NOT NULL,
                    FOREIGN KEY(playlistId) REFERENCES Playlist(id)`
                ),
                this.createTable("Track",
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    millis INTEGER NOT NULL,
                    title TEXT NOT NULL DEFAULT 'Fara titlu',
                    coverURI TEXT CHECK((coverURI NOT NULL AND platform IS 'NONE') OR (coverURI IS NULL AND platform IS NOT 'NONE')),
                    favorite BOOLEAN DEFAULT 0,
                    platform TEXT CHECK(platform IN ('NONE', 'SPOTIFY', 'SOUNDCLOUD', 'YOUTUBE')) DEFAULT 'NONE',
                    artistId INTEGER NOT NULL,
                    playlistId INTEGER NOT NULL,
                    UNIQUE(title, millis),
                    FOREIGN KEY(artistId) REFERENCES Artist(id),
                    FOREIGN KEY(playlistId) REFERENCES Playlist(id)`
                ),
                this.createTable("TrackConfig",
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    shuffleWeight REAL DEFAULT 0,
                    loopRepeats INTEGER DEFAULT 1,
                    volumeBoost REAL DEFAULT 0,
                    pitch REAL DEFAULT 0,
                    speed REAL DEFAULT 0,
                    startMillis INTEGER DEFAULT 0,
                    endMillis INTEGER DEFAULT 0,
                    playlistConfigId INTEGER NOT NULL,
                    FOREIGN KEY(playlistConfigId) REFERENCES PlaylistConfig(id)`
                ),
                this.createTable("Queue",
                    `id INTEGER PRIMARY KEY AUTOINCREMENT,
                    channel TEXT NOT NULL CHECK(channel IN ('MAIN', 'EAVESDROP')),
                    currentTrack INTEGER,
                    currentMillis INTEGER DEFAULT 0,
                    playlistId INTEGER,
                    FOREIGN KEY(playlistId) REFERENCES Playlist(id)`
                )
            ]).then(() => {
                console.log("");
                console.log("Tables were created successfully!");
                console.log(`Registered tables: ${Array.from(this.TABLES).join(", ")}`);
                resolve();
            }).catch(error => reject(error));
        });
    }

    /**
     * Creates a new table in the database, if it doesn't exist already
     * @param {string} name Table name
     * @param {string} columns Comma-separated column names with their type and restrictions, foreign keys, etc.
     * @returns {Promise} The ResultSet on resolve, the error on reject. Prints the error to the console
     */
    createTable(name, columns) {
        return new Promise(async (resolve, reject) => {
            await this.instance.transaction(async tx => {
                await tx.executeSql(`CREATE TABLE IF NOT EXISTS ${name} (${columns})`, 
                    null, 
                    (txObj, rs) => {
                        this.TABLES.add(name);
                        resolve(rs);
                    },
                    (txObj, error) => {
                        reject(error);
                        console.log(error);
                    }
                );
            });
        });
    }

    /**
     * Performs an SQL query on the database
     * @param {string} table Table name, case sensitive
     * @param {string[]} [columns] An array containing the column names. If not specified, all columns will be selected
     * @param {string} [conditions] SQL conditions. If not specified, all rows will be selected for the specified columns
     * @param {any[]} [args] Values to replace placeholders with, if specified in columns and/or conditions
     * @returns {Promise<any[]>} An array of row objects on resolve, the error on reject. Prints the error to the console
     */
    selectFrom(table, columns=["*"], conditions, args = []) {
        const cols = columns == null || columns == [] ? ["*"] : columns.join(", ");
        const conds = conditions ? ` WHERE ${conditions}` : ``;

        return new Promise(async (resolve, reject) => {
            await this.instance.transaction(async tx => {
                await tx.executeSql(`SELECT ${cols} FROM ${table}${conds}`, 
                    args, 
                    (txObj, rs) => resolve(rs.rows._array),
                    (txObj, error) => {
                        reject(error);
                        console.log(error);
                    }
                );
            });
        });
    }

    /**
     * Performs an SQL insertion on the database
     * @param {string} table Table name, case sensitive
     * @param {object} payload Object containing the column names as keys and their values respectively
     * @returns {Promise<ResultSet>} The ResultSet on resolve, the error on reject. Prints the error to the console
     */
    insertInto(table, payload={}) {
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
                    (txObj, rs) => resolve(rs), 
                    (txObj, error) => {
                        reject(error);
                        console.log(error);
                    }
                );
            });
        });
    }

    /**
     * Performs multiple concurrent SQL insertions on the database
     * @param {string} table Table name, case sensitive
     * @param {object[]} payloads Array containing objects with the column names as keys and their values respectively
     * @returns {Promise<ResultSet[]>} All ResultSets for each insert on resolve, the error on reject, if one failed. Prints the error to the console
     */
    insertBulkInto(table, payloads=[{}]) {
        return Promise.all(payloads.map(payload => this.insert(table, payload)));
    }

    /**
     * Performs an SQL update on the database
     * @param {string} table Table name, case sensitive
     * @param {string} values A string containing values/placeholders for the columns
     * @param {string} [conditions] SQL conditions. If not specified, all rows all be updated
     * @param {any[]} [args] Values to replace placeholders with, if specified in columns and/or values
     * @returns {Promise<ResultSet>} The ResultSet on resolve, the error on reject. Prints the error to the console
     */
    update(table, values, conditions, args=[]) {
        const conds = conditions ? ` WHERE ${conditions}` : ``;
        return new Promise(async (resolve, reject) => {
            await this.instance.transaction(async tx => {
                await tx.executeSql(`UPDATE ${table} SET ${values}${conds}`,
                    args,
                    (txObj, rs) => resolve(rs), 
                    (txObj, error) => {
                        reject(error);
                        console.log(error);
                    }
                )
            });
        })
    }

    /**
     * Performs an SQL delete on the database
     * @param {string} table Table name, case sensitive
     * @param {string} [conditions] SQL conditions. If not specified, all rows will be deleted
     * @param {any[]} [args] Values to replace placeholders with, if specified in conditions
     * @returns {Promise<ResultSet>} The ResultSet on resolve, the error on reject. Prints the error to the console
     */
    deleteFrom(table, conditions, args=[]) {
        const conds = conditions ? ` WHERE ${conditions}` : ``;
        return new Promise(async (resolve, reject) => {
            await this.instance.transaction(async tx => {
                await tx.executeSql(`DELETE FROM ${table}${conds}`,
                    args,
                    (txObj, rs) => resolve(rs), 
                    (txObj, error) => {
                        reject(error);
                        console.log(error);
                    }
                );
            });
        });
    }

    /**
     * Performs any SQL statement on the database
     * @param {*} statement SQL statement
     * @param {*} args Values to replace placeholders with, if specified in statement
     * @returns {Promise<ResultSet>} The ResultSet on resolve, the error on reject. Prints the error to the console
     */
    exec(statement, args=[]) {
        return new Promise(async (resolve, reject) => {
            await this.instance.transaction(async tx => {
                await tx.executeSql(statement, args,
                    (txObj, rs) => resolve(rs), 
                    (txObj, error) => {
                        reject(error);
                        console.log(error);
                    }
                );
            });
        });
    }

    /**
     * Checks if data following given conditions exists in a table
     * @param {string} table Table name
     * @param {string} conditions SQL conditions. Accepts placeholders
     * @param {any[]} [args] Values to replace placeholders with, if specified in conditions
     * @returns {Promise<boolean>} Resolves with a boolean that indicates the existence of the data
     */
    existsIn(table, conditions, args = []) {
        return this.selectFrom(table, null, conditions, args)
            .then(rows => rows.length > 0);
    }

    /**
     * Drops the specified table
     * @param {string} table Table name
     * @returns {Promise<ResultSet>} Resolves with a ResultSet when done
     */
    drop(table) {
        return this.exec(`DROP TABLE IF EXISTS ${table}`)
            .then(() => this.TABLES.delete(table));
    }

    /**
     * Drops all tables in the database
     * @returns {Promise<ResultSet[]>} Resolves with an array of ResultSets for each drop when done
     */
    dropAll() {
        return Promise.all(Array.from(this.TABLES).map(this.drop));
    }

    /**
     * Clears all data from the table and resets its autoincrement sequence.
     * 
     * This method is preffered over using `Database.deleteFrom` when you want to delete every
     * row and reset the autoincrement sequence at the same time
     * @param {string} table Table name
     * @returns {Promise<ResultSet>} Resolves with a ResultSet when done
     */
    truncate(table) {
        return this.deleteFrom(table).then(() => this.resetSequenceFor(table));
    }

    /**
     * Clears all data from the database and resets all autoincrement sequences
     * @returns {Promise<ResultSet[]>} Resolves with an array of ResultSets for each truncation when done
     */
    truncateAll() {
        return Promise.all(Array.from(this.TABLES).map(this.truncate));
    }

    /**
     * Resets the autoincrement sequence for a table
     * @param {string} table Table name
     * @returns {Promise<ResultSet>} Resolves a ResultSet when the sequence was updated
     */
    resetSequenceFor(table) {
        return this.update("sqlite_sequence", "seq = 0", "name = ?", [table]);
    }

    /**
     * Resets all autoincrement sequences for all tables in the database
     * @returns {Promise<ResultSet[]>} Resolves with an array of ResultSets for each reset when done
     */
    resetSequenceAll() {
        return Promise.all(Array.from(this.TABLES).map(this.resetSequenceFor));
    }

    /**
     * Prints all values in a table
     * @param {string} table Table name
     */
    valuesOf(table) {
        console.log("");
        console.log(`== ${table} ====`);
        this.selectFrom(table).then(rows => {
            for(const row of rows) console.log(`${row.id}: `, row);
        });
    }
}
