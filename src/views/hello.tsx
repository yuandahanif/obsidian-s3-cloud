import { App } from "obsidian";
import { useApp } from "src/contexts/useAppContext";

export const ReactView = () => {
	const { vault } = useApp() as App;

	return <h4>{vault.getName()}</h4>;
};
