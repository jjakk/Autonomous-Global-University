import z from "zod";
import type Course from "./classes/Course/Course";
import type { Unit } from "./classes/Course/Unit";
import type { Reading } from "./classes/Course/Reading";

export const readingSchema: z.ZodType<Reading> = z.object({
    title: z.string(),
    description: z.string(),
    content: z.array(z.string()).optional(),
    read: z.boolean().optional()
});

export const readingSchema_JSON = {
    type: "object",
    properties: {
        title: { type: "string" },
        description: { type: "string" },
        content: { type: "array", items: { type: "string", description: "Content written in Markdown format starting with a subheader" } },
    },
    required: ["title", "description"]
};

export const unitsSchema: z.ZodType<Unit[]> = z.array(z.object({
    name: z.string(),
    readings: readingSchema.array(),
}));

export const unitsSchema_JSON = {
    type: "array",
    items: {
        type: "object",
        properties: {
            name: { type: "string" },
            readings: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                    },
                    required: ["title", "description"]
                }
            }
        },
        required: ["name", "readings"]
    }
};

export const coursesSchema: z.ZodType<Course[]> = z.array(z.object({
    name: z.string(),
    description: z.string(),
    type: z.enum(["core", "elective"]),
    progress: z.number().default(0),
}));

export const coursesSchema_JSON = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "name": { "type": "string" },
            "description": { "type": "string" },
            "type": { "type": "string", "enum": ["core", "elective"] }
        },
        "required": ["name", "description", "type"]
    }
};