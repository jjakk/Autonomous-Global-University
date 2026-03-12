import Dexie from "dexie";
import AppAuth from "./AppAuth";

export enum SupportedModels {
    GEMINI = "gemini",
};
const USER_DB_SCHEMA = "apiKey,firstName,major,model";
export interface User {
    apiKey: string;
    firstName: string;
    lastName?: string;
    major: string
    model: SupportedModels;
};

const YEAR_DB_SCHEMA = "++id,name,&index";
export interface Year {
    id: string;
    name: string;
    index: number;
}

const COURSE_DB_SCHEMA = "++id,yearId,name,description,type";
export interface Course {
    id: string;
    yearId: string;
    name: string;
    description: string;
    type: "core" | "elective";
};

const UNIT_DB_SCHEMA = "++id,courseId,name";
export interface Unit {
    id: string;
    courseId: string;
    name: string;
};

const READING_DB_SCHEMA = "++id,unitId,title,description,read,content";
export interface Reading {
    id: string;
    unitId: string;
    title: string;
    description: string;
    read?: boolean;
    content?: string[];
};

export class AguDatabase extends Dexie {
    users!: Dexie.Table<User, number>;
    years!: Dexie.Table<Year, number>;
    courses!: Dexie.Table<Course, number>;
    units!: Dexie.Table<Unit, number>;
    readings!: Dexie.Table<Reading, number>;

    constructor(version: number = 1) {
        super("AguDatabase");
        this.version(version).stores({
            users: USER_DB_SCHEMA,
            years: YEAR_DB_SCHEMA,
            courses: COURSE_DB_SCHEMA,
            units: UNIT_DB_SCHEMA,
            readings: READING_DB_SCHEMA,
        });
    }

    async printDatabaseContents(): Promise<void> {
        const result: Record<string, unknown[]> = {};
        for (const table of this.tables) {
            result[table.name] = await table.toArray();
        }
        console.log("Database Contents:", result);
    }

    // USER METHODS
    async createUser(newUsr: Omit<User, "id">): Promise<void> {
        const existingUsers: User[] = await this.users.toArray();
        if(existingUsers.length > 0) {
            console.warn("User already exists. Overwriting existing user.");
            await this.users.clear();
        }

        await this.users.add(newUsr);

        AppAuth.login();
        console.log("User created and logged in: ", newUsr.firstName);
    }
    async getUser(): Promise<User> {
        const users: User[] = await this.users.toArray();
        if(users.length === 0) {
            AppAuth.logout();
            throw new Error("No user found in database.");
        }
        else if(users.length > 1) {
            console.warn("Multiple users found in database. This should not happen; returning the first user & deleting the rest.");
            await this.users.toCollection().offset(1).delete();
        }
        return users[0];
    }
    async getUserApiKey(): Promise<string> {
        const user = await this.getUser();
        return user.apiKey;
    }
};

export const aguDb = new AguDatabase();