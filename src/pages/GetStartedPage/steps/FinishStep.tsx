import { Button } from "primereact/button";
import type { StepComponentProps } from "../GetStartedPage";
import { aguDb, type User } from "../../../classes/AguDatabase";
import { useState } from "react";

export default function FinishStep(props: StepComponentProps) {
    const [loading, setLoading] = useState(false);

    const getStarted = async () => {
        setLoading(true);
        const createUserForm: Omit<User, "id"> = props.data as Omit<User, "id">;

        await aguDb.createUser(createUserForm);
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