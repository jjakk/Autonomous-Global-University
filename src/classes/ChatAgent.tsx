import { GoogleGenAI } from "@google/genai";
import AppStorage from "./AppStorage";
import { coursesSchema, coursesSchema_JSON, readingSchema, readingSchema_JSON, unitsSchema, unitsSchema_JSON } from "../zodTypes";
import type Course from "./Course/Course";
import type { Unit } from "./Course/Unit";
import type { Reading } from "./Course/Reading";

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
            AppStorage.markRateLimitHit();
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
    async createCourses(major: string): Promise<Course[]> {
        try {
            const prompt = `Create a 4 year curriculum for a university student majoring in ${major}. Include core courses, electives, and a brief description of each course. Order the courses starting with the easiest first, and the more rigorous courses later.`;
            const response = await this.ai.models.generateContent({
                model: ChatAgent.model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: coursesSchema_JSON,
                }
            });
    
            if(!response.text) {
                throw new Error("No response from AI");
            }
            const courses: Course[] = coursesSchema.parse(JSON.parse(response.text))
                .map((c: Course) =>
                    ({ ...c, units: [] })
            );
            return courses;
        }
        catch (error) {
            ChatAgent.onFailedRequest(error);
            throw new Error("Failed to create courses. See console for details.");
        }
    }
    async createUnits(course: Course): Promise<Unit[]> {
        try {
            const prompt = `Create 15 weekly units (each with a few readings) for the following course: "${course.name}", with the following description: "${course.description}`;
            const response = await this.ai.models.generateContent({
                model: ChatAgent.model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: unitsSchema_JSON,
                }
            });
    
            if(!response.text) {
                throw new Error("No response from AI");
            }
            const units: Unit[] = unitsSchema.parse(JSON.parse(response.text));
            return units;
        }
        catch (error) {
            ChatAgent.onFailedRequest(error);
            throw new Error("Failed to create courses. See console for details.");
        }
    }
    async createReadingContent(reading: Reading): Promise<Reading> {
        try {
            const prompt = `Create me a reading for the following reading: "${reading.title}", with the following description: "${reading.description}". It should be about a 30 minute read and formatted as paragraphs of text.`;
            const response = await this.ai.models.generateContent({
                model: ChatAgent.model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: readingSchema_JSON,
                }
            });
    
            if(!response.text) {
                throw new Error("No response from AI");
            }
            const updatedReading: Reading = readingSchema.parse(JSON.parse(response.text));
            return updatedReading;
        }
        catch (error) {
            ChatAgent.onFailedRequest(error);
            throw new Error("Failed to create courses. See console for details.");
        }
    }
};