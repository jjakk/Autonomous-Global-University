import courses from "./data/courses.json";
import units from "./data/units.json";
import readings from "./data/readings.json";
import { ChatAgentResources } from "../AguDatabase";

const MOCK_DATA_BY_RESOURCE: Record<ChatAgentResources, unknown> = {
    [ChatAgentResources.COURSES]: courses,
    [ChatAgentResources.UNITS]: units,
    [ChatAgentResources.READINGS]: readings,
};



export default class MockData {
    private static _fakeLatency = 500; // milliseconds

    static async generate(jsonSchema: { title: ChatAgentResources; [key: string]: any }): Promise<{ text: string }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const generatedData = MOCK_DATA_BY_RESOURCE[jsonSchema.title];
                resolve({ text: JSON.stringify(generatedData) });
            }, this._fakeLatency);    
        });
    }
};