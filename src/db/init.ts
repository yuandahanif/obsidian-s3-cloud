import { App, FileSystemAdapter, normalizePath, Notice } from "obsidian";
import initSqlJs, { Database as DB, SqlJsStatic } from "sql.js";
import { S3CloudSettings } from "@/types/settings";
import * as manifest from "manifest.json";

const TABLE_MIGRATION = `DROP TABLE IF EXISTS files; \
CREATE TABLE files( id INTEGER PRIMARY KEY AUTOINCREMENT, file_name text, key text, upload_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;

export class Database {
	private app: App;
	private db: DB | undefined = undefined;
	private settings: S3CloudSettings;

	constructor(app: App, setting: S3CloudSettings) {
		this.app = app;
		this.settings = setting;
	}

	async init() {
		const { settings } = this;
		let absolutePath: string | undefined = "";

		if (settings.local_directory == "") {
			new Notice("Please set the local directory in the settings");
			throw new Error("Local directory not set");
		}

		const adapter = this.app.vault.adapter;
		if (adapter instanceof FileSystemAdapter) {
			absolutePath = adapter.getBasePath();
		}

		if (!absolutePath) {
			throw new Error("Could not get absolute path");
		}

		// Create a database
		const SQL = await initSqlJs({
			// Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
			// You can omit locateFile completely when running in node
			locateFile: (_file) =>
				`${absolutePath}/${this.app.vault.configDir}/plugins/${manifest.id}/assets/sql-wasm.wasm`,
		});

		this.getDb(SQL);
	}

	async getDb(db_instance: SqlJsStatic) {
		try {
			const { settings } = this;

			const local_db = await this.app.vault.adapter.readBinary(
				`${this.settings.local_directory}/${settings.local_db_name}.sqlite`
			);

			if (settings.local_db_name == "") {
				throw new Error("Local database name not set");
			}

			this.db = new db_instance.Database(Buffer.from(local_db));
		} catch (error) {
			this.createDb(db_instance);
			new Notice("Error while getting database");
			console.error("Error while getting database", error);
		}
	}

	async createDb(db_instance: SqlJsStatic) {
		try {
			const { settings } = this;

			const db = new db_instance.Database();
			const binaryArray = db.export();
			await this.app.vault.adapter.writeBinary(
				normalizePath(
					`${settings.local_directory}/${settings.local_db_name}.sqlite`
				),
				binaryArray
			);
		} catch (error) {
			new Notice("Error while creating database");
			console.error("Error while creating database", error);
		}
	}

	async run_migration() {
		if (!this.db) {
			throw new Error("Database not initialized");
		}

		this.db.run(TABLE_MIGRATION);
	}

	async query(query: string) {
		if (!this.db) {
			throw new Error("Database not initialized");
		}

		return this.db.exec(query);
	}
}
