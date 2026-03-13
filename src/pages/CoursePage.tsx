import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { evalUnitProgress } from "../utils";
import { ProgressBar } from "primereact/progressbar";
import ChatAgent from "../classes/ChatAgent";
import { ProgressSpinner } from "primereact/progressspinner";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { aguDb, type Course, type Unit } from "../classes/AguDatabase";
import UnitPreview from "../components/UnitPreview";

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
            <div className="flex flex-row items-center gap-4 m-4">
                <Button onClick={() => navigate("/plan-of-study")} icon="pi pi-chevron-left" rounded />
                <h1>{course?.name}</h1>
            </div>
            <h3 className="m-4">{course?.description}</h3>
            <h2 className="m-4">Curriculum</h2>
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
                                <div className="flex flex-row items-center gap-2">
                                    <span className="flex-1">
                                        {unit.name}
                                    </span>
                                    <div className="flex-1">
                                        <ProgressBar
                                            value={evalUnitProgress(unit)}
                                        ></ProgressBar>
                                    </div>
                                </div>
                            }
                        >
                            <h3>{unit.name}</h3>
                            <UnitPreview unit={unit} />
                        </AccordionTab>
                    ))}
                </Accordion>
            )}
        </div>
    );
}

export default CoursePage;