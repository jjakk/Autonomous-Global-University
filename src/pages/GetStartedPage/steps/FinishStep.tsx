import { Button } from "primereact/button";
import type { StepComponentProps } from "../GetStartedPage";
import type { Course, User } from "../../../classes/AguDatabase";
import AppStorage from "../../../classes/AppStorage";
import ChatAgent from "../../../classes/ChatAgent";
import { useState } from "react";

export default function FinishStep(props: StepComponentProps) {
    const [loading, setLoading] = useState(false);

    const getStarted = async () => {
        const user: User = {
            apiKey,
            major,
            model,
        }
        AppStorage.saveUser(user);
        const agent = new ChatAgent(apiKey);
        const courses: Course[] = await agent.createCourses(major);
        AppStorage.saveCourses(courses);

        props.onComplete();
    };

    return (
        <>
            <Button
                label="Get Started"
                loading={loading}
                onClick={getStarted}
            />
        </>
    );
}