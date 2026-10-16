import { api } from "./apiClient";

export interface Usernames {
	id: string;
	username: string;
}

export async function resolveUsernames(
	ids: string[]
): Promise<Record<string, string>> {
	if (ids.length === 0) return {};
	const params = `userIds=${ids.join(",")}`
	console.log(`Params = ${params} from ${ids}`)
	const data = await api.get<Usernames[]>(`user?${params},`);
	return Object.fromEntries(data.map((u) => [u.id, u.username]));
}