import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { evalUnitProgress } from "../utils";
import { ProgressBar } from "primereact/progressbar";
import ChatAgent from "../classes/ChatAgent";
import { ProgressSpinner } from "primereact/progressspinner";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { aguDb, type Course, type Unit } from "../classes/AguDatabase";

function CoursePage() {
    let { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingContent, setLoadingContent] = useState<boolean>(false);

    const createNewUnits = async (course: Course): Promise<Unit[]> => {
        let newUnits: Unit[] = [];
        setLoadingContent(true);
        if(course) {
            const apiKey = await aguDb.getUserApiKey();
            const chatAgent = new ChatAgent(apiKey);
            newUnits = await chatAgent.createUnits(course);
        }
        setLoadingContent(false);
        return newUnits;
    };

    useEffect(() => {
        (async function() {
            const retrievedCourse: Course | undefined = await aguDb.courses.get(parseInt(courseId || ""));

            if(!retrievedCourse) {
                alert("Course not found.");
                navigate("/plan-of-study");
                return;
            }
            else {
                setCourse(retrievedCourse);
            }
        })();
    }, [courseId]);

    useEffect(() => {
        (async () => {
            if(!course) return;

            let retrievedUnits: Unit[] = await aguDb.units.where("courseId").equals(parseInt(courseId || "")).toArray();

            // If no units exist, create them & throw them in the databse
            if(!retrievedUnits?.length) {
                retrievedUnits = await createNewUnits(course);
                aguDb.units.bulkAdd(retrievedUnits);   
            }
            
            setUnits(retrievedUnits);
        })();
    }, [course]);
    
    return (
        <div>
            <Button label="Plan of Study" onClick={() => navigate("/plan-of-study")} icon="pi pi-chevron-left" />
            <h1 className="m-2">{course?.name}</h1>
            <h3 className="m-4">{course?.description}</h3>
            {/* <ProgressBar
                value={evalCourseProgress(course)}
            ></ProgressBar> */}
            <h2 className="m-2">Curriculum</h2>
            {loadingContent ? (
                <div>
                    <ProgressSpinner />
                </div>
            ) : (
                <Accordion>
                    {units.map((unit, index) => (
                        <AccordionTab
                            key={index}
                            header={
                                <div>
                                    <span>
                                        {unit.name}
                                    </span>
                                    <div>
                                        <ProgressBar
                                            value={evalUnitProgress(unit)}
                                        ></ProgressBar>
                                    </div>
                                </div>
                            }
                            // disabled={!unit.unlocked}
                        >
                            <h3>{unit.name}</h3>
                            {/* {unit.readings.map((reading, rIndex, array) => (
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
                            ))} */}
                        </AccordionTab>
                    ))}
                </Accordion>
            )}
        </div>
    );
}

export default CoursePage;