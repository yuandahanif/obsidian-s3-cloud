import { ItemView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext } from "src/contexts/context";
import { ReactView } from "./hello";

export const VIEW_WRAPPER_ID = "example-view";

export class ViewWrapper extends ItemView {
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_WRAPPER_ID;
	}

	getDisplayText() {
		return "Your Files";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<AppContext.Provider value={this.app}>
				<ReactView />
			</AppContext.Provider>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
