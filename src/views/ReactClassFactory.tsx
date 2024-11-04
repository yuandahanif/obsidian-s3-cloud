import { ItemView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext } from "src/contexts/context";
import { ReactView } from "./hello";

const VIEW_TYPE_EXAMPLE = "example-view";

export class ReactSkeleton extends ItemView {
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Example view";
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
