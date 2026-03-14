import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Splitter, SplitterPanel } from "primereact/splitter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { aguDb, type Course, type Reading } from "../classes/AguDatabase";
import { useAsyncLoading } from "../hooks";
import { PageLoading } from "../components/PageLoading";
import Section from "../components/Section";

function ReadingPage() {
    let { courseId, readingId } = useParams();
    const navigate = useNavigate();
    const ranOnLoad = useRef(false);

    const [course, setCourse] = useState<Course | null>(null);
    const [reading, setReading] = useState<Reading | null>(null);

    const markAsRead = async () => {
        if(reading) {
            await aguDb.readings.update(reading.id, { read: true });
            setReading({ ...reading, read: true });
        }
    };

    const _retreiveCourse = async (cId: number) => {
        const crs = !isNaN(cId) ? await aguDb.courses.get(cId) : undefined;
        if(!crs) {
            alert("Course not found.");
            navigate("/");
        }
        else {
            setCourse(crs);
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

    const { loading: loadingCourse, wrapped: retreiveCourse } = useAsyncLoading(_retreiveCourse);
    const { loading: loadingReading, wrapped: retreiveReading } = useAsyncLoading(_retreiveReading);
    const loading = loadingCourse || loadingReading || !course || !reading;

    useEffect(() => {
        if(readingId && courseId) {
            if(ranOnLoad.current) return;
            ranOnLoad.current = true;

            retreiveCourse(parseInt(courseId));
            retreiveReading(parseInt(readingId));
        }
    }, []);

    return loading ? PageLoading() : (
        <div className="flex flex-col gap-6">
            <div className="flex flex-row items-center gap-4">
                <Button
                    onClick={() => navigate(`/course/${courseId}`)}
                    label={`Back to ${course.name}`}
                    icon="pi pi-chevron-left"
                    className="flex-shrink-0"
                />
            </div>
            <h1>{reading.title || "Loading..."}</h1>
            <span className="text-xl ml-4">{reading.description || "Loading..."}</span>
            <Section className="flex flex-col p-6">
                    {reading?.content?.map((paragraph, index) => (
                        <div key={index} className="mt-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{paragraph}</ReactMarkdown>
                        </div>
                    ))}
            </Section>
            <div>
                <Button
                    label="Mark as Read"
                    severity="success"
                    disabled={reading?.read}
                    outlined={!reading?.read}
                    onClick={markAsRead}
                />
            </div>
        </div>
    );
}

export default ReadingPage;