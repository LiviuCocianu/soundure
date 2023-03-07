import * as SQLite from 'expo-sqlite'

export default class Database {
    /**
    * A database object that allows for general control over the application's database
    */
    constructor() {
        this.instance = undefined;
        this.TABLES = [];
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
                console.log(`Registered tables: ${this.TABLES.join(", ")}`);
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
                        resolve(rs);
                        this.TABLES.push(name);
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
     * @param {string} [columns] A string containing the comma-separated list of columns. If not specified, all columns will be selected
     * @param {string} [conditions] SQL conditions. If not specified, all rows will be selected for the specified columns
     * @param {any[]} [args] Values to replace placeholders, if specified in columns and/or conditions
     * @returns {Promise} An array of row objects on resolve, the error on reject. Prints the error to the console
     */
    select(table, columns="*", conditions, args = []) {
        const conds = conditions ? ` WHERE ${conditions}` : ``;
        return new Promise(async (resolve, reject) => {
            await this.instance.transaction(async tx => {
                await tx.executeSql(`SELECT ${columns} FROM ${table}${conds}`, 
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
     * @param {string} values A string containing values/placeholders for the columns
     * @param {string[]} [columns] If not specified, all columns must have a value in values
     * @param {any[]} [args] Values to replace placeholders, if specified in columns and/or values
     * @returns {Promise} The ResultSet on resolve, the error on reject. Prints the error to the console
     */
    insert(table, values, columns, args = []) {
        const cols = columns ? ` (${columns.join(", ")})` : ``;
        return new Promise(async (resolve, reject) => {
            await this.instance.transaction(async tx => {
                await tx.executeSql(`INSERT INTO ${table}${cols} VALUES (${values})`, 
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
     * Performs multiple concurrent SQL insertions on the database
     * @param {string} table Table name, case sensitive
     * @param {string} values A string containing values/placeholders for the columns
     * @param {string[]} [columns] If not specified, all columns must have a value in values
     * @param {any[]} [argArray] Array of values to replace placeholders, if specified in columns and/or values, for all rows to insert
     * @returns {Promise} All ResultSets for each insert on resolve, the error on reject, if one failed. Prints the error to the console
     */
    insertBulk(table, values, columns, argArray=[]) {
        const promises = [];

        for(args of argArray) {
            promises.push(this.insert(table, values, columns, args));
        }

        return Promise.all(promises);
    }

    /**
     * Performs an SQL update on the database
     * @param {string} table Table name, case sensitive
     * @param {string} values A string containing values/placeholders for the columns
     * @param {string} [conditions] SQL conditions. If not specified, all rows all be updated
     * @param {any[]} [args] Values to replace placeholders, if specified in columns and/or values
     * @returns {Promise} The ResultSet on resolve, the error on reject. Prints the error to the console
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
     * @param {string} [conditions] SQL conditions. If not specified, all rows all be deleted
     * @param {any[]} [args] Values to replace placeholders, if specified in conditions
     * @returns {Promise} The ResultSet on resolve, the error on reject. Prints the error to the console
     */
    delete(table, conditions, args=[]) {
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
     * @param {*} args Values to replace placeholders, if specified in statement
     * @returns {Promise} The ResultSet on resolve, the error on reject. Prints the error to the console
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

    dropAll() {
        this.instance.transaction(tx => {
            for(const table of this.TABLES) {
                tx.executeSql("DROP TABLE IF EXISTS " + table);
            }
        });
    }

    truncateAll() {
        Promise.all(this.TABLES.map(table => this.delete(table)))
        .then(() => {
            Promise.all(this.TABLES.map(table => this.update("sqlite_sequence", "seq = 0", "name = ?", [table])))
            console.log("All tables were truncated");
        });
    }

    describe(table) {
        console.log("");
        console.log(`== ${table} - valori ====`);
        this.instance.transaction(tx => {
            tx.executeSql("SELECT * FROM " + table, null, (txObj, rs) => {
                for (const value of rs.rows._array) {
                    console.log(value);
                }
            });
        });
    }
}
