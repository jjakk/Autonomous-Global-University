import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "primereact/progressbar";
import ChatAgent from "../classes/ChatAgent";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { aguDb, type Course, type Unit } from "../classes/AguDatabase";
import UnitPreview from "../components/UnitPreview";
import { useAsyncLoading } from "../hooks";
import { PageLoading } from "../components/PageLoading";

function CoursePage() {
    let { courseId } = useParams();
    const navigate = useNavigate();
    const ranOnLoad = useRef(false);

    const [course, setCourse] = useState<Course | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);

    const createNewUnits = async (course: Course): Promise<Unit[]> => {
        const apiKey = await aguDb.getUserApiKey();
        const chatAgent = new ChatAgent(apiKey);

        const newUnits = await chatAgent.createUnits(course);
        await aguDb.units.bulkAdd(newUnits as Unit[]);
        
        return await aguDb.units.toArray();
    };

    const _retreiveCourse = async (crsId: number): Promise<void> => {
        const retrievedCourse: Course | undefined = !isNaN(crsId)
            ? await aguDb.courses.get(crsId)
            : undefined;
        if(!retrievedCourse) {
            alert("Course not found.");
            navigate("/plan-of-study");
        }
        else {
            setCourse(retrievedCourse);
        }
    };
    const _retreiveUnits = async (course: Course, crsId: number): Promise<void> => {
        let retrievedUnits: Unit[] = await aguDb.units.where("courseId").equals(crsId).toArray();

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

    useEffect(() => {
        if(courseId) {
            if(ranOnLoad.current) return;
            ranOnLoad.current = true;

            retreiveCourse(parseInt(courseId));
        }
    }, []);

    useEffect(() => {
        if(course) {
            retreiveUnits(course, parseInt(course.id))
        };
    }, [course]);
    
    return /*loadingContent*/true ? PageLoading({ message: "Loading course content..." }) : (
        <div className="flex flex-col items-stretch gap-4">
            <div className="flex flex-col items-start gap-4">
                <Button
                    label="Back to Plan of Study"
                    onClick={() => navigate("/plan-of-study")}
                    icon="pi pi-chevron-left"
                />
                <h1>{course?.name}</h1>
                <h3 className="ml-4">{course?.description}</h3>
            </div>
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
        </div>
    );
}

export default CoursePage;