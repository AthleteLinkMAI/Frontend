const ACCESS_KEY = "athletelink_access_token";

let inMemoryAccess: string | null = null;

export const tokenStorage = {
    getAccess(): string | null {
		return inMemoryAccess;
	},

    setAccess: (access: string) => {
        inMemoryAccess = access;
    },

    clear: () => {
		inMemoryAccess = null;
    },
};