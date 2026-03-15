import { GoogleGenAI } from "@google/genai";
import { coursesSchema, coursesSchema_JSON, readingsSchema, readingsSchema_JSON, unitsSchema, unitsSchema_JSON, type Course, type Reading, type Unit } from "./AguDatabase";

export default class ChatAgent {
    private static model = "gemini-2.5-flash";
    private ai: GoogleGenAI;
    private currentController: AbortController | null;

    constructor(apiKey: string) {
        if(!apiKey) {
            throw new Error("API key is required to initialize ChatAgent");
        }
        this.ai = new GoogleGenAI({ apiKey });
        this.currentController = null;
    }

    private static onFailedRequest(error: any) {
        if(error?.status === 429) {
            console.error("Rate limit hit");
        }
        else if(error.name === "AbortError") {
            console.warn("Previous request aborted due to new request");
        }
        else {
            console.error("Error in ChatAgent request: ", error);
        }
    }
    private async createDataStructure<T>(prompt: string, zodSchema: any, jsonSchema: any): Promise<T[]> {
        try {
            if (this.currentController) {
                this.currentController.abort();
            }
            this.currentController = new AbortController();
            const response = await this.ai.models.generateContent({
                model: ChatAgent.model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: jsonSchema,
                    abortSignal: this.currentController.signal
                },
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
        finally {
            this.currentController = null;
        }
    }

    static async testKey(key: string): Promise<boolean> {
        try {
            const testAI = new GoogleGenAI({ apiKey: key });
            const response = await testAI.models.generateContent({
                model: ChatAgent.model,
                contents: "Test",
                config: { maxOutputTokens: 5 },
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
            `Create weekly units for the following course: "${course.name}", with the following description: "${course.description}`,
            unitsSchema,
            unitsSchema_JSON
        );
        const unitsWithCourseId: Partial<Unit>[] = units.map((u: UnitWithoutCourseId) => ({ ...u, courseId: course.id }));
        return unitsWithCourseId;
    }
    async createUnitReadings(unit: Unit): Promise<Reading[]> {
        const readings: Omit<Reading, 'unitId' | 'read'>[] = await this.createDataStructure<Omit<Reading, 'unitId' | 'read'>>(
            `Create a few readings for the following unit: "${unit.name}", with the following description: "${unit.description}`,
            readingsSchema,
            readingsSchema_JSON
        );
        const readingsWithUnitId: Reading[] = readings.map((r: Omit<Reading, 'unitId' | 'read'>) => ({ ...r, unitId: unit.id, read: false }));
        return readingsWithUnitId;
    }
    // async createUnitsWithReadings(course: Course): Promise<{ units: Partial<Unit>[], readings: Partial<Reading>[] }> {
    //     type UnitWithReadings = Partial<Unit> & { readings?: Partial<Reading>[] };

    //     const units: UnitWithReadings[] = await this.createDataStructure<UnitWithReadings>(
    //         `Create 15 weekly units (each with a few readings) for the following course: "${course.name}", with the following description: "${course.description}`,
    //         unitsWithReadingsSchema,
    //         unitsWithReadingsSchema_JSON
    //     );
    //     const readings: Partial<Reading>[] = [];
    //     console.log(units);
    //     for(let i = 0; i < units.length; i++) {
    //         const unit = units[i];
    //         for(const reading of unit.readings || []) {
    //             readings.push({ ...reading, read: false });
    //         }
    //         delete units[i].readings;
    //     }
    //     console.log(units, readings);

    //     return { units, readings };
    // }
};