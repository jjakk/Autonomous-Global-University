import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import type { StepComponentProps } from "../GetStartedPage";
import { useState } from "react";
import MAJOR_OPTIONS from "../../../majors.json";
import { Button } from "primereact/button";

const getDepartmentFromMajor = (major: string | undefined): string | null => {
    if(!major) return null;
    for(const department in MAJOR_OPTIONS) {
        if(MAJOR_OPTIONS[department as keyof typeof MAJOR_OPTIONS].some(m => m === major)) {
            return department;
        }
    }
    return null;
};

export default function MajorSelectionStep(props: StepComponentProps) {
    const [department, setDepartment] = useState<string>(getDepartmentFromMajor(props.data.major) || "");
    const [major, setMajor] = useState<string>(props.data.major || "");
    const [customMajor, setCustomMajor] = useState(false);

    const submitMajorSelection = () => {
        if(major && major.trim() !== "") {
            props.onComplete({ major: major.trim() });
        }
        else {
            alert("Please select or enter a valid major.");
        }
    };

    return (
        <form className="flex flex-col gap-4 items-start" onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); submitMajorSelection(); }}>
            <div className="flex flex-row gap-4 items-end">
                {customMajor ? (
                    <div className="flex flex-col gap-2">
                            <label htmlFor="custom_major">Custom Major:</label>
                            <InputText
                                id="custom_major"
                                placeholder="Custom Major"
                                value={major}
                                onChange={(e) => setMajor(e.target.value)}
                            />
                    </div>
                ) : (
                    <div className="flex flex-row gap-8 flex-wrap items-end">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="department">Department:</label>
                            <Dropdown
                                value={department}
                                onChange={(e) => setDepartment(e.value)}
                                options={Object.keys(MAJOR_OPTIONS)}
                                optionLabel="department"
                                placeholder="Select a Department"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="major">Major:</label>
                            <Dropdown
                                disabled={!department}
                                value={major}
                                onChange={(e) => setMajor(e.value)}
                                options={department ? MAJOR_OPTIONS[department as keyof typeof MAJOR_OPTIONS] : []}
                                optionLabel="major"
                                placeholder="Select a Major"
                                className="w-full md:w-14rem"
                            />
                        </div>
                    </div>
                )}
                <Button label="Select" type="submit" disabled={!major || major.trim() === ""} />
            </div>
            <span> 
                <a className="cursor-pointer text-blue-500 hover:underline" onClick={() => setCustomMajor(!customMajor)}>
                    { customMajor ? 'Cancel' : 'Create a Custom Major' }
                </a>
            </span>
        </form>
    );
}