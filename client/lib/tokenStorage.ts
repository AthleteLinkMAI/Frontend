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