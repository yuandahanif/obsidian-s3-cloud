import initSqlJs, { SqlJsStatic } from "sql.js";

export class Database {
	private db: SqlJsStatic |  null = null;

	constructor() {
		// Create a database
		this.init();
	}

	async init() {
		// Create a database
		const SQL = await initSqlJs({
			// Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
			// You can omit locateFile completely when running in node
			locateFile: (file) => `https://sql.js.org/dist/`,
		});

		this.db = SQL;
	}
}
