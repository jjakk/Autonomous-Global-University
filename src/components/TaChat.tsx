import "./TaChat.scss";
import { Button } from "primereact/button";
import { aguDb, type Course } from "../classes/AguDatabase";
import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { useAsyncLoading } from "../hooks";
import ChatAgent from "../classes/ChatAgent";

interface TaChatProps {
    selectedCourse: Course;
}

const getStartingMessage = (courseName: string) => `Hey, I'll be your TA for ${courseName}, let me know if you have any questions!`;

export default function TaChat(props: TaChatProps) {
    const scrollPanelRef = useRef(null);
    
    const [chatHistory, setChatHistory] = useState<{ sender: "ta" | "student"; message: string }[]>([
        { sender: "ta", message: getStartingMessage(props.selectedCourse.name) },
    ]);
    const [currentInput, setCurrentInput] = useState("");

    const _getTaResponse = async (question: string): Promise<string> => {
        const user = await aguDb.getUser();
        const chatAgent = new ChatAgent(user.apiKey);
        const response = await chatAgent.askTaQuestion(props.selectedCourse, question);
        return response;
    };
    const { loading: loadingTaResponse, wrapped: getTaResponse } = useAsyncLoading(_getTaResponse);

    const sendMesage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCurrentInput("");
        setChatHistory(prev => [...prev, { sender: "student", message: currentInput }]);
        const response = await getTaResponse(currentInput);
        setChatHistory(prev => [...prev, { sender: "ta", message: response }]);
    };

    useEffect(() => {
        if (scrollPanelRef.current) {
            // @ts-ignore
            scrollPanelRef.current.scrollTop = scrollPanelRef.current.scrollHeight + 100;
        }
    }, [chatHistory]);

    useEffect(() => {
        setChatHistory([{ sender: "ta", message: getStartingMessage(props.selectedCourse.name) }]);
    }, [props.selectedCourse]);

    return (
        <div className="chat-wrapper mt-4">
            <div
                ref={scrollPanelRef}
                className="h-[300px] w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-3"
            >
                <div className="flex flex-col gap-2">
                    {chatHistory.map((entry, index) => (
                        <p
                            key={index}
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                entry.sender === "ta"
                                    ? "self-start bg-gray-100 text-gray-900"
                                    : "self-end bg-blue-500 text-white"
                            }`}
                        >
                            {entry.message}
                        </p>
                    ))}
                    {loadingTaResponse && (
                        <p
                            className="self-start max-w-[80%] rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-900 animate-pulse"
                        >
                            <i className="pi pi-spin pi-spinner-dotted"></i>
                        </p>
                    )}
                </div>
            </div>
            <form className="ta-input-form mt-4" onSubmit={sendMesage}>
                <InputText
                    placeholder="Ask a question"
                    className="w-full"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                />
                <Button
                    icon="pi pi-send"
                    type="submit"
                    disabled={currentInput.trim() === "" || currentInput.length > 200 || chatHistory[chatHistory.length - 1]?.sender === "student"}
                />
            </form>
        </div>
    );
};