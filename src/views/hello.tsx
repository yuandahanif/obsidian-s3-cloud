import { useApp } from "src/contexts/useAppContext";

export const ReactView = () => {
	const { vault } = useApp()!;

	return <h4>{vault.getName()}</h4>;
};
