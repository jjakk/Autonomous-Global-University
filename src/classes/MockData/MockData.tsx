import courses from "./data/courses.json";
import units from "./data/units.json";
import readings from "./data/readings.json";

export default class MockData {
    static async generate(jsonSchema: any): Promise<{ text: string }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                let generatedData;
                switch(jsonSchema.title) {
                    case "courses":
                        generatedData = courses;
                        break;
                    case "units":
                        generatedData = units;
                        break;
                    case "readings":
                        generatedData = readings;
                        break;
                    default:
                        throw new Error(`No mock data available for schema title: ${jsonSchema.title}`);
                }
                resolve({ text: JSON.stringify(generatedData) });
            }, 500);    
        });
    }
};