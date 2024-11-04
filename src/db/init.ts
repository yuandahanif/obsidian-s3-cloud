import { App, FileSystemAdapter } from "obsidian";
import initSqlJs, { Database as DB } from "sql.js";

import * as manifest from "manifest.json";

export class Database {
	private app: App;
	private db: DB | undefined = undefined;

	constructor(app: App) {
		this.app = app;
		this.init();
	}

	async init() {
		let absolutePath: string | undefined = "";

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

		const db = await this.app.vault.adapter.readBinary("files/history.sqlite"); // FIXME: change to actual db name
		this.db = new SQL.Database(Buffer.from(db));
	}

	async query(query: string) {
		if (!this.db) {
			throw new Error("Database not initialized");
		}

		return this.db.exec(query);
	}
}
