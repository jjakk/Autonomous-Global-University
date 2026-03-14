import { GoogleGenAI } from "@google/genai";
import { coursesSchema, coursesSchema_JSON, readingsSchema, readingsSchema_JSON, unitsSchema, unitsSchema_JSON, type Course, type Reading, type Unit } from "./AguDatabase";

export default class ChatAgent {
    private static model = "gemini-2.5-flash";
    private ai: GoogleGenAI;

    constructor(apiKey: string) {
        if(!apiKey) {
            throw new Error("API key is required to initialize ChatAgent");
        }
        this.ai = new GoogleGenAI({ apiKey });
    }

    private static onFailedRequest(error: any) {
        if(error?.status === 429) {
            console.log("Rate limit hit. Marking in storage.");
            // AppStorage.markRateLimitHit();
        }
        else {
            console.error("Error in ChatAgent request: ", error);
        }
    }
    private async createDataStructure<T>(prompt: string, zodSchema: any, jsonSchema: any): Promise<T[]> {
        try {
            const response = await this.ai.models.generateContent({
                model: ChatAgent.model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: jsonSchema,
                }
            });
    
            if(!response.text) {
                throw new Error("No response from AI");
            }
            return zodSchema.parse(JSON.parse(response.text));
        }
        catch (error) {
            ChatAgent.onFailedRequest(error);
            throw new Error("Failed to create courses. See console for details.");
        }
    }

    static async testKey(key: string): Promise<boolean> {
        try {
            const testAI = new GoogleGenAI({ apiKey: key });
            const response = await testAI.models.generateContent({
                model: ChatAgent.model,
                contents: "Test",
            });
            return !!response.text;
        }
        catch (error) {
            ChatAgent.onFailedRequest(error);
            return false;
        }
    }
    async createPlanOfStudy(major: string): Promise<Course[]> {
            const courses: Course[] = await this.createDataStructure<Course>(
                `Create a 4 year curriculum for a university student majoring in ${major}. Include core courses, electives, and a brief description of each course. Order the courses starting with the easiest first, and the more rigorous courses later.`,
                coursesSchema,
                coursesSchema_JSON
            );
            return courses;
    }
    async createUnits(course: Course): Promise<Partial<Unit>[]> {
        type UnitWithoutCourseId = Omit<Unit, "id" | "courseId">;
        const units: UnitWithoutCourseId[] = await this.createDataStructure<UnitWithoutCourseId>(
            `Create 15 weekly units (each with a few readings) for the following course: "${course.name}", with the following description: "${course.description}`,
            unitsSchema,
            unitsSchema_JSON
        );
        const unitsWithCourseId: Partial<Unit>[] = units.map((u: UnitWithoutCourseId) => ({ ...u, courseId: course.id }));
        return unitsWithCourseId;
    }
    async createUnitReadings(unit: Unit): Promise<Reading[]> {
        const readings: Omit<Reading, 'unitId' | 'read'>[] = await this.createDataStructure<Omit<Reading, 'unitId' | 'read'>>(
            `Create 5 readings for the following unit: "${unit.name}", with the following description: "${unit.description}`,
            readingsSchema,
            readingsSchema_JSON
        );
        const readingsWithUnitId: Reading[] = readings.map((r: Omit<Reading, 'unitId' | 'read'>) => ({ ...r, unitId: unit.id, read: false }));
        return readingsWithUnitId;
    }
    async createReadingContent(reading: Reading): Promise<Reading> {
        // const updatedReading: Reading = await this.createDataStructure<Reading>(
        //     `Create me a reading for the following reading: "${reading.title}", with the following description: "${reading.description}". It should be about a 30 minute read and formatted as paragraphs of text.`,
        //     readingSchema,
        //     readingSchema_JSON
        // );
        // return updatedReading;
        // TODO
        return reading;
    }
};