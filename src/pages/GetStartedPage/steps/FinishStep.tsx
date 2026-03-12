import { Button } from "primereact/button";
import type { StepComponentProps } from "../GetStartedPage";
import { aguDb, type Course, type User } from "../../../classes/AguDatabase";
import ChatAgent from "../../../classes/ChatAgent";
import { useState } from "react";

export default function FinishStep(props: StepComponentProps) {
    const [loading, setLoading] = useState(false);

    const getStarted = async () => {
        setLoading(true);
        const createUserForm: Omit<User, "id"> = props.data as Omit<User, "id">;

        await aguDb.createUser(createUserForm);
        const user: User = await aguDb.getUser();
        const agent = new ChatAgent(user.apiKey);
        const courses: Course[] = await agent.createPlanOfStudy(user.major);
        // Clear & load new courses
        await aguDb.courses.clear();
        await aguDb.courses.bulkAdd(courses);
        setLoading(false);
        props.onComplete({});
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