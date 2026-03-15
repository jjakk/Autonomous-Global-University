import Dexie from "dexie";
import z from "zod";
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
    id: number;
    name: string;
    index: number;
}

// COURSE types & schemas
const COURSE_DB_SCHEMA = "++id,yearId,name,description,type";
export interface Course {
    id: number;
    yearId: string;
    name: string;
    description: string;
    type: "core" | "elective";
    code: number;
};
export const coursesSchema: z.ZodType = z.array(z.object({
    name: z.string(),
    description: z.string(),
    type: z.enum(["core", "elective"]),
    code: z.number().int().positive(),
}));
export const coursesSchema_JSON = {
    type: "array",
    minItems: 3,
    maxItems: 5,
    uniqueItems: true,
    // Requires validator support (e.g., ajv-keywords) to enforce uniqueness by a specific property.
    uniqueItemProperties: ["code"],
    items: {
        type: "object",
        properties: {
            name: { type: "string" },
            description: { type: "string" },
            type: { type: "string", enum: ["core", "elective"] },
            code: {
                type: "number",
                minimum: 100,
                maximum: 499,
                description: "A course code indicating its difficulty level (e.g., 100-199 for freshman courses, 200-299 for sophomore courses, etc.)",
            },
        },
        required: ["name", "description", "type", "code"],
    },
};

// UNIT types & schemas
const UNIT_DB_SCHEMA = "++id,courseId,name";
export interface Unit {
    id: number;
    courseId: number;
    name: string;
    description: string;
};
export const unitsSchema: z.ZodType = z.array(
    z.object({
        name: z.string(),
        description: z.string(),
    })
);
export const unitsSchema_JSON = {
    type: "array",
    minItems: 15,
    maxItems: 15,
    items: {
        type: "object",
        properties: {
            name: { type: "string" },
            description: { type: "string" },
        },
        required: ["name", "description"]
    }
};

// READING types & schemas
const READING_DB_SCHEMA = "++id,unitId,title,description,read,content";
export interface Reading {
    id: number;
    unitId: number;
    title: string;
    description: string;
    content: string[];
    read: boolean;
};
export const readingsSchema: z.ZodType = z.array(
    z.object({
        title: z.string(),
        description: z.string(),
        content: z.array(z.string())
    })
);
export const readingsSchema_JSON = {
    type: "array",
    // minItems: 3,
    // maxItems: 4,
    items: {
        type: "object",
        properties: {
            title: { type: "string" },
            description: { type: "string" },
            content: { type: "array", items: { type: "string", description: "Content written in Markdown format starting with a subheader" } },
        },
        required: ["title", "description", "content"]
    }
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