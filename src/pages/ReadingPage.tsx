import { useNavigate, useParams } from "react-router-dom";
import type { Reading } from "../classes/Course/Reading";
import "./ReadingPage.scss";
import { useEffect, useState } from "react";
import AppStorage from "../classes/AppStorage";
import type { Unit } from "../classes/Course/Unit";
import { ProgressSpinner } from "primereact/progressspinner";
import ChatAgent from "../classes/ChatAgent";
import { Button } from "primereact/button";
import { getCourseLabel } from "../utils";
import { Card } from "primereact/card";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { RadioButton } from "primereact/radiobutton";
import ReactMarkdown from "react-markdown";


function ReadingPage() {
    let { courseIndex, unitIndex, readingIndex } = useParams();
    const course = AppStorage.getCourses()?.[parseInt(courseIndex || "-1")];
    const navigate = useNavigate();
    const [reading, setReading] = useState<Reading | null>(null);
    const [loadingContent, setLoadingContent] = useState<boolean>(false);

    const retreiveReadingContent = async (reading: Reading): Promise<Reading> => {
        const chatAgent = new ChatAgent(AppStorage.getUser()?.apiKey || "");
        const updatedReading = await chatAgent.createReadingContent(reading);
        return updatedReading;
    };

    const markAsRead = () => {
        if(reading) {
            const updatedReading = { ...reading, read: true };
            setReading(updatedReading);
            AppStorage.markReadingAsRead(
                parseInt(courseIndex || "-1"),
                parseInt(unitIndex || "-1"),
                parseInt(readingIndex || "-1")
            );
        }
    };

    useEffect(() => {
        const units: Unit[] | null = AppStorage.getCourseUnits(parseInt(courseIndex || "-1"));
        if(units) {
            const foundUnit = units[parseInt(unitIndex || "-1")];
            if(foundUnit) {
                const foundReading = foundUnit.readings[parseInt(readingIndex || "-1")];
                if(foundReading) {
                    setReading(foundReading);
                }
            }
        }
    }, [courseIndex, unitIndex, readingIndex]);

    useEffect(() => {
        (async function() {
            if(reading) {
                if(!reading.content) {
                    setLoadingContent(true);
                    const newReading: Reading = await retreiveReadingContent(reading);
                    setReading(newReading);
                    // Update the reading content in storage
                    AppStorage.addReadingContent(
                        parseInt(courseIndex || "-1"),
                        parseInt(unitIndex || "-1"),
                        parseInt(readingIndex || "-1"),
                        newReading.content || []
                    );
                    setLoadingContent(false);

                }
            }
        })();
    }, [reading]);

    return (
        <div className="reading-page">
            <Button
                label={(
                    course
                        ? getCourseLabel(course, parseInt(courseIndex || "-1"))
                        : "Course Page"
                )}
                severity="secondary"
                onClick={() => navigate(`/course/${courseIndex}`)}
                icon="pi pi-chevron-left"
            />
            <h1>{reading?.title}</h1>
            {loadingContent ? (
                <div className="loading-content">
                    <ProgressSpinner />
                </div>
            ) : (
                <>
                    <Splitter className="reading-content">
                        <SplitterPanel className="reading-content-text" minSize={25}>
                            <h1>Reading</h1>
                            {reading?.content?.map((paragraph, index) => (
                                <div key={index}>
                                    <ReactMarkdown>{paragraph}</ReactMarkdown>
                                </div>
                            ))}
                        </SplitterPanel>
                        <SplitterPanel minSize={25}>
                            <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                                <h1>Quiz</h1>
                                {/* {[
                                    { question: "What is the main topic of the reading?", options: ["Option A", "Option B", "Option C", "Option D"] },
                                    { question: "Which of the following is a key takeaway from the reading?", options: ["Option A", "Option B", "Option C", "Option D"] },
                                    { question: "How does the reading relate to the overall course material?", options: ["Option A", "Option B", "Option C", "Option D"] },
                                ].map((q, index) => (
                                    <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", justifyContent: "space-between" }} key={index}>
                                        <h3 key={index}>{q.question}</h3>
                                        {q.options.map((option, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <RadioButton inputId={`option${i}`} name={`question${index}`} value={option} onChange={(e) => {}} checked={false} />
                                                <label htmlFor={`option${i}`} className="ml-2">{option}</label>
                                            </div>
                                        ))}
                                        <Button label="Check" onClick={() => {}} style={{ alignSelf: "center" }} />
                                    </div>
                                ))} */}
                            </div>
                        </SplitterPanel>
                    </Splitter>
                    <div className="end-of-reading-actions">
                        <Button
                            label="Mark as Read"
                            severity="success"
                            disabled={reading?.read}
                            outlined={!reading?.read}
                            onClick={markAsRead}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default ReadingPage;