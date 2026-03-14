import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProgressBar } from "primereact/progressbar";
import ChatAgent from "../classes/ChatAgent";
import { ProgressSpinner } from "primereact/progressspinner";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { aguDb, type Course, type Unit } from "../classes/AguDatabase";
import UnitPreview from "../components/UnitPreview";
import { useAsyncLoading } from "../hooks";

function CoursePage() {
    let { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);

    const createNewUnits = async (course: Course): Promise<Unit[]> => {
        const apiKey = await aguDb.getUserApiKey();
        const chatAgent = new ChatAgent(apiKey);

        const newUnits = await chatAgent.createUnits(course);
        await aguDb.units.bulkAdd(newUnits as Unit[]);
        
        return await aguDb.units.toArray();
    };

    const _retreiveCourse = async (courseId: number): Promise<void> => {
        const retrievedCourse: Course | undefined = await aguDb.courses.get(courseId);
        if(!retrievedCourse) {
            alert("Course not found.");
            navigate("/plan-of-study");
        }
        else {
            setCourse(retrievedCourse);
        }
    };
    const _retreiveUnits = async (course: Course, courseId: number): Promise<void> => {
        let retrievedUnits: Unit[] = await aguDb.units.where("courseId").equals(courseId).toArray();

        if(!retrievedUnits?.length) {
            console.warn("No units found for course. Creating units...");
            retrievedUnits = await createNewUnits(course);
            console.log("Units created and loaded to database: ", retrievedUnits);
        }

        setUnits(retrievedUnits);
    };

    const { loading: loadingCourse, wrapped: retreiveCourse } = useAsyncLoading(_retreiveCourse);
    const { loading: loadingUnits, wrapped: retreiveUnits } = useAsyncLoading(_retreiveUnits);
    const loadingContent = loadingCourse || loadingUnits;

    useEffect(() => { courseId ? retreiveCourse(parseInt(courseId)) : null}, [courseId]);
    useEffect(() => { course ? retreiveUnits(course, parseInt(course.id)) : null }, [course]);
    
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
                                            // value={evalUnitProgress(unit)}
                                            value={0}
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