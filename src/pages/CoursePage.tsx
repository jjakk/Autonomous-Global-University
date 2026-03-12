import { useNavigate, useParams } from "react-router-dom";
import "./CoursePage.scss"
import { useEffect, useState } from "react";
import AppStorage from "../classes/AppStorage";
import { evalCourseProgress, evalUnitProgress, getCourseLabel } from "../utils";
import { ProgressBar } from "primereact/progressbar";
import ChatAgent from "../classes/ChatAgent";
import { ProgressSpinner } from "primereact/progressspinner";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import type { Course, Unit } from "../classes/AguDatabase";

function CoursePage() {
    let { courseIndex } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingContent, setLoadingContent] = useState<boolean>(false);

    const createNewUnits = async (course: Course): Promise<Unit[]> => {
        let newUnits: Unit[] = [];
        setLoadingContent(true);
        if(course) {
            const chatAgent = new ChatAgent(AppStorage.getUser()?.apiKey || "");
            newUnits = await chatAgent.createUnits(course);
            setLoadingContent(false);
        }
        setLoadingContent(false);
        return newUnits;
    };

    useEffect(() => {
        (async function() {
            const courses: Course[] | null = AppStorage.getCourses();
            if(!courseIndex || !courses) {
                alert(`Error: Could not find this course`);
                navigate("/");
            }
            else {
                const index = parseInt(courseIndex);
                if(!isNaN(index) && index >= 0 && index < courses.length) {
                    setCourse(courses[index]);
                }
            }
        })();
    }, [courseIndex]);

    useEffect(() => {
        (async () => {
            if(course?.units?.length) {
                setUnits(course.units);
            }
            else if(course) {
                const newUnits: Unit[] = await createNewUnits(course);
                AppStorage.addCourseUnits(course, newUnits);
                setUnits(newUnits);
            }
        })();
    }, [course]);
    
    return (
        <div>
            <Button label="Plan of Study" onClick={() => navigate("/plan-of-study")} icon="pi pi-chevron-left" />
            <h1>{course ? getCourseLabel(course, parseInt(courseIndex || "0")) : ""}</h1>
            <h2>{course?.description}</h2>
            <ProgressBar
                value={evalCourseProgress(course)}
            ></ProgressBar>
            <h2>Curriculum</h2>
            {loadingContent ? (
                <div className="loading-content">
                    <ProgressSpinner />
                </div>
            ) : (
                <Accordion>
                    {units.map((unit, index) => (
                        <AccordionTab
                            key={index}
                            header={
                                <div className="unit-header">
                                    <span className="unit-header-text">
                                        {unit.name}
                                    </span>
                                    <div className="unit-header-progress">
                                        <ProgressBar
                                            value={evalUnitProgress(unit)}
                                        ></ProgressBar>
                                    </div>
                                </div>
                            }
                            // disabled={!unit.unlocked}
                        >
                            <h3>{unit.name}</h3>
                            {unit.readings.map((reading, rIndex, array) => (
                                <div key={rIndex}>
                                    <h4>Reading {rIndex + 1} - {reading.title}</h4>
                                    <h5>{reading.description}</h5>
                                    <Button
                                        label={"View Reading " + (reading.read ? "(Complete)" : "(Incomplete)")}
                                        onClick={() => navigate(`/course/${courseIndex}/unit/${index}/reading/${rIndex}`)}
                                        severity="success"
                                        outlined={!reading.read}
                                        disabled={rIndex > 0 && array[rIndex - 1].read === false}
                                    />
                                </div>
                            ))}
                        </AccordionTab>
                    ))}
                </Accordion>
            )}
        </div>
    );
}

export default CoursePage;