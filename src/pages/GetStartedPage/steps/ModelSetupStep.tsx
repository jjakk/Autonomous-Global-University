import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import type { StepComponentProps } from "../GetStartedPage";
import { useState } from "react";
import ChatAgent from "../../../classes/ChatAgent";
import { SupportedModels } from "../../../classes/AguDatabase";

export default function ModelSetupStep(props: StepComponentProps) {
    const [model, setModel] = useState(props.data.model || SupportedModels.GEMINI);
    const [apiKey, setApiKey] = useState(props.data.apiKey || "");
    const [loading, setLoading] = useState(false);

      const submitApiKey = async () => {
        setLoading(true);
        const isValid = await ChatAgent.testKey(apiKey);
        setLoading(false);
        if (isValid) {
            props.onComplete({ model, apiKey });
        } else {
            alert("Invalid API Key. Please try again.");
        }
    };

    return (
        <>
            <form className="flex flex-row gap-4" onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); submitApiKey(); }}>
                <Dropdown
                    value={model}
                    onChange={(e) => setModel(e.value)}
                    options={Object.values(SupportedModels)}
                    optionLabel="name" 
                    placeholder="Select a Model"
                />
                <InputText
                    placeholder="API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
                <Button label="Save" type="submit" loading={loading} />
            </form>
            <span>
                Don't have a key? Get one from <a href="https://aistudio.google.com/app/api-keys" target="_blank" className="text-blue-500 hover:underline">Google Cloud Console</a>
            </span>
            <small>
                *Please note that your API key will be stored securely and used only for this application. No 3rd party other than
                the AI model provider will have access to your API key.
                <br />
            </small>
        </>
    );
}