declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string;
            owner: string;
            mongo_uri: string;
        }
    }
}

export {}