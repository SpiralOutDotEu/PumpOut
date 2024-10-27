import { DatabaseInterface } from "./DatabaseInterface";
import { sqliteDatabase } from "./sqlite";

// Set the implementation to the SQLite database.
// To switch to another database, replace `sqliteDatabase` with another implementation.
export const database: DatabaseInterface = sqliteDatabase;
