declare global {
    namespace NodeJS {
        interface String {
            capitalizeWord: f;
            capitalizeWords: string;
            mongo_uri: string;
        }
    }
}

export {};
