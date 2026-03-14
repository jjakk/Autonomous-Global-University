import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import ChatAgent from "../classes/ChatAgent";
import { Button } from "primereact/button";
import { getCourseLabel } from "../utils";
import { Splitter, SplitterPanel } from "primereact/splitter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { aguDb, type Reading, type Unit } from "../classes/AguDatabase";
import { useAsyncLoading } from "../hooks";

function ReadingPage() {
    let { courseId, readingId } = useParams();
    const navigate = useNavigate();
    const ranOnLoad = useRef(false);

    const [reading, setReading] = useState<Reading | null>(null);

    const markAsRead = async () => {
        if(reading) {
            await aguDb.readings.update(reading.id, { read: true });
            setReading({ ...reading, read: true });
        }
    };

    const _retreiveReading = async (rId: number) => {
        const rd: Reading | undefined = !isNaN(rId)
            ? await aguDb.readings.get(rId)
            : undefined;

        if(!rd) {
            alert("Reading not found.");
            navigate(`/course/${courseId}`);
        }
        else {
            setReading(rd);
        }
    };
    const { loading, wrapped: retreiveReading } = useAsyncLoading(_retreiveReading);

    useEffect(() => {
        if(readingId) {
            if(ranOnLoad.current) return;
            ranOnLoad.current = true;

            retreiveReading(parseInt(readingId));
        }
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-row items-center gap-4">
                <Button
                    severity="secondary"
                    onClick={() => navigate(`/course/${courseId}`)}
                    icon="pi pi-chevron-left"
                    className="flex-shrink-0"
                    rounded
                />
                <h1>{reading?.title || "Loading..."}</h1>
            </div>
            {loading ? (
                <div>
                    <ProgressSpinner />
                </div>
            ) : (
                <>
                    <Splitter>
                        <SplitterPanel minSize={25} className="p-6 flex flex-col gap-4">
                            {reading?.content?.map((paragraph, index) => (
                                <div key={index}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{paragraph}</ReactMarkdown>
                                </div>
                            ))}
                        </SplitterPanel>
                        {/* <SplitterPanel minSize={25}></SplitterPanel> */}
                        {/* <SplitterPanel minSize={25}>
                            <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                                <h1>Quiz</h1>
                                {[
                                    { question: "What is the main topic of the reading?", options: ["Option A", "Option B", "Option C", "Option D"] },
                                    { question: "Which of the following is a key takeaway from the reading?", options: ["Option A", "Option B", "Option C", "Option D"] },
                                    { question: "How does the reading relate to the overall course material?", options: ["Option A", "Option B", "Option C", "Option D"] },
                                ].map((q, index) => (
                                    <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", justifyContent: "space-between" }} key={index}>
                                        <h3 key={index}>{q.question}</h3>
                                        {q.options.map((option, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <RadioButton inputId={`option${i}`} name={`question${index}`} value={option} onChange={(e) => {}} checked={false} />
                                                <label htmlFor={`option${i}`} >{option}</label>
                                            </div>
                                        ))}
                                        <Button label="Check" onClick={() => {}} style={{ alignSelf: "center" }} />
                                    </div>
                                ))}
                            </div>
                        </SplitterPanel> */}
                    </Splitter>
                    <div>
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