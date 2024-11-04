import {
	App,
	// Modal,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
} from "obsidian";
import { ViewWrapper, VIEW_WRAPPER_ID } from "@/views/ViewWrapper";
import { Database } from "@/db/init";
import { FolderSuggest } from "@/utils/suggesters/FolderSuggester";

interface S3CloudSettings {
	s3_accessKeyId: string;
	s3_secretAccessKey: string;
	s3_region: string;
	s3_bucket: string;

	local_directory: string;
	local_db_name: string;
	local_when_delete: "delete" | "move_to_trash";
}

const DEFAULT_SETTINGS: S3CloudSettings = {
	s3_accessKeyId: "",
	s3_secretAccessKey: "",
	s3_region: "",
	s3_bucket: "",

	local_directory: "",
	local_db_name: "s3cloud",
	local_when_delete: "move_to_trash",
};

export default class S3Cloud extends Plugin {
	settings: S3CloudSettings;
	private database: Database;

	async onload() {
		await this.loadSettings();
		this.database = new Database(this.app);

		this.registerView(VIEW_WRAPPER_ID, (leaf) => new ViewWrapper(leaf));

		// This creates an icon in the left ribbon.
		this.addRibbonIcon("dice", "Sample Plugin", (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			// new Notice("This is a notice!");
			if (!this.app.workspace.layoutReady) {
				// Workspace is still loading, do nothing
				return;
			}

			this.activateView();
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_WRAPPER_ID);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({ type: VIEW_WRAPPER_ID, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf!);
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		const { contentEl } = this;
// 		contentEl.setText("Woah!");
// 	}

// 	onClose() {
// 		const { contentEl } = this;
// 		contentEl.empty();
// 	}
// }

class SampleSettingTab extends PluginSettingTab {
	plugin: S3Cloud;

	constructor(app: App, plugin: S3Cloud) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl, app } = this;

		containerEl.empty();

		const allFoldersOptions: Record<string, (value?: string) => string> =
			{};

		app.vault.getAllFolders().forEach((folder) => {
			allFoldersOptions[folder.path] = () => folder.path;
		});
		console.log(
			"SampleSettingTab ~ display ~ allFoldersOptions:",
			allFoldersOptions
		);

		new Setting(containerEl)
			.setName("File temporary Directory")
			.setDesc("It's a place to store temporary files before uploading")
			.addSearch((cb) => {
				new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: folder1/folder2")
					.setValue(this.plugin.settings.local_directory)
					.onChange((new_folder) => {
						this.plugin.settings.local_directory = new_folder;
						this.plugin.saveSettings();
					});
				// @ts-ignore
				cb.containerEl.addClass("templater_search");
			});

		new Setting(containerEl)
			.setName("Database Name")
			.setDesc("set the name of the database")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.local_db_name)
					.onChange(async (value) => {
						this.plugin.settings.local_db_name = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
