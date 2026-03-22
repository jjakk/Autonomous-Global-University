import courses from "./data/courses.json";
import units from "./data/units.json";
import readings from "./data/readings.json";
import { ChatAgentResources } from "../AguDatabase";

const MOCK_DATA_BY_RESOURCE: Record<ChatAgentResources, unknown> = {
    [ChatAgentResources.COURSES]: courses,
    [ChatAgentResources.UNITS]: units,
    [ChatAgentResources.READINGS]: readings,
};

interface GenArgs {
    config: {
        responseJsonSchema?: {
            title: ChatAgentResources;
            [key: string]: any;
        }
    }
    [key: string]: any;
};


export default class MockData {
    private static _fakeLatency = 1000; // milliseconds

    static async generate(genArgs: GenArgs): Promise<{ text: string }> {
        const { responseJsonSchema } = genArgs.config;

        if(!responseJsonSchema) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ text: "Mock response text" });
                }, MockData._fakeLatency);
            });
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                const generatedData = MOCK_DATA_BY_RESOURCE[responseJsonSchema.title];
                resolve({ text: JSON.stringify(generatedData) });
            }, MockData._fakeLatency);    
        });
    }
};