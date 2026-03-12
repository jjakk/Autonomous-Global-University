import Dexie from "dexie";

export enum SupportedModels {
    GEMINI = "gemini",
};
const USER_DB_SCHEMA = "id,apiKey,firstName,major,model";
export interface User {
    id: string;
    apiKey: string;
    firstName: string;
    lastName?: string;
    major: string
    model: SupportedModels;
};

const YEAR_DB_SCHEMA = "id,name,&index";
export interface Year {
    id: string;
    name: string;
    index: number;
}

const COURSE_DB_SCHEMA = "id,yearId,name,description,type";
export interface Course {
    id: string;
    yearId: string;
    name: string;
    description: string;
    type: "core" | "elective";
};

const UNIT_DB_SCHEMA = "id,courseId,name";
export interface Unit {
    id: string;
    courseId: string;
    name: string;
};

const READING_DB_SCHEMA = "id,unitId,title,description,read,content";
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
    Units!: Dexie.Table<Unit, number>;
    Readings!: Dexie.Table<Reading, number>;

    constructor(version: number = 1) {
        super("AguDatabase");
        this.version(version).stores({
            users: USER_DB_SCHEMA,
            years: YEAR_DB_SCHEMA,
            courses: COURSE_DB_SCHEMA,
            Units: UNIT_DB_SCHEMA,
            Readings: READING_DB_SCHEMA,
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
        await this.users.add({
            id: crypto.randomUUID(),
            ...newUsr,
        });
    }
    async getUser(): Promise<User | null> {
        const users: User[] = await this.users.toArray();
        if(users.length === 0) {
            console.warn("No user found in database.");
            return null;
        }
        else if(users.length > 1) {
            console.warn("Multiple users found in database. This should not happen; returning the first user & deleting the rest.");
            await this.users.toCollection().offset(1).delete();
        }
        return users[0];
    }

    // COURSE METHODS
    async addCourse(newCourse: Omit<Course, "id">): Promise<void> {
        await this.courses.add({
            id: crypto.randomUUID(),
            ...newCourse,
        });
    }
    async getCourses(): Promise<Course[]> {
        return await this.courses.toArray();
    }
};