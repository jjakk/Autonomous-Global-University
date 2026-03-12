import { InputText } from "primereact/inputtext";
import type { StepComponentProps } from "../GetStartedPage";
import { Button } from "primereact/button";
import { useState } from "react";

export const ProfileSetup = (props: StepComponentProps) => {
    const [firstName, setFirstName] = useState<string>(props.data.firstName || "");
    const [lastName, setLastName] = useState<string>(props.data.lastName || "");

    const onSubmit = () => {
        if(!firstName.trim()) {
            setFirstName("Guest");
        }

        props.onComplete({
            firstName: firstName.trim() ? firstName : "Guest",
            lastName
        }); 
    };

    return (
        <>
            <form className="flex flex-row gap-8 flex-wrap items-end" onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit(); }}>
                <div className="flex flex-col gap-2">
                    <label htmlFor="name">First Name:</label>
                    <InputText
                        id="name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-col gap-2">
                    <label htmlFor="lastName">Last Name:</label>
                    <InputText
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <Button label="Save" type="submit" />
            </form>
            <span>First and last names are optional—if you leave them blank, we'll use "Guest" instead.</span>
        </>
    );
}