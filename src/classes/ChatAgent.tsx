import { GoogleGenAI } from "@google/genai";
import { coursesSchema, coursesSchema_JSON, readingSchema, readingSchema_JSON, unitsSchema, unitsSchema_JSON, type Course, type Reading, type Unit } from "./AguDatabase";

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
    }
    private async createDataStructure(prompt: string, schema: any): Promise<any> {
        try {
            const response = await this.ai.models.generateContent({
                model: ChatAgent.model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: schema,
                }
            });
    
            if(!response.text) {
                throw new Error("No response from AI");
            }
            return schema.parse(JSON.parse(response.text))
                .map((c: Course) =>
                    ({ ...c, units: [] })
            );
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
            const courses: Course[] = this.createDataStructure(
                `Create a 4 year curriculum for a university student majoring in ${major}. Include core courses, electives, and a brief description of each course. Order the courses starting with the easiest first, and the more rigorous courses later.`,
                coursesSchema
            );

            return courses.map((c: Course) =>
                ({ ...c, units: [] })
            );
    }
    async createUnits(course: Course): Promise<Unit[]> {
        const units: Unit[] = this.createDataStructure(
            `Create 15 weekly units (each with a few readings) for the following course: "${course.name}", with the following description: "${course.description}`,
            unitsSchema
        );
        return units.map((u: Unit) => ({ ...u, courseId: course.id }));
    }
    async createReadingContent(reading: Reading): Promise<Reading> {
        const updatedReading: Reading = this.createDataStructure(
            `Create me a reading for the following reading: "${reading.title}", with the following description: "${reading.description}". It should be about a 30 minute read and formatted as paragraphs of text.`,
            readingSchema
        );
        return updatedReading;
    }
};