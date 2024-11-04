import {
	App,
	// Modal,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
} from "obsidian";
import { ViewWrapper, VIEW_WRAPPER_ID } from "@/views/ViewWrapper";
import { Database } from "./db/init";

interface S3CloudSettings {
	name: string;
}

const DEFAULT_SETTINGS: S3CloudSettings = {
	name: "default",
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
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.name)
					.onChange(async (value) => {
						this.plugin.settings.name = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
