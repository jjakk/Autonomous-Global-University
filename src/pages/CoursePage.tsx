import "./CoursePage.scss";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ChatAgent from "../classes/ChatAgent";
import { Button } from "primereact/button";
import { aguDb, type Course, type Unit } from "../classes/AguDatabase";
import UnitPreview from "../components/UnitPreview";
import { useAsyncLoading } from "../hooks";
import { PageLoading } from "../components/PageLoading";
import Section from "../components/Section";

import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { getCompletedUnits, getCourseLabel } from "../utils";
        

function CoursePage() {
    let { courseId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const ranOnLoad = useRef(false);

    const [course, setCourse] = useState<Course | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [unitCompletions, setUnitCompletions] = useState<Map<number, boolean>>(new Map());
    
    const activeStep = units.findIndex(u => u.id === parseInt(searchParams.get("unit") ?? ""));
      const handleStepChange = (e: any) => {
        const selectedUnit = units[e.index];
        setSearchParams({ unit: selectedUnit.id.toString() });
    };

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
    const _retreiveUnits = async (course: Course): Promise<void> => {
        let retrievedUnits: Unit[] = await aguDb.units.where("courseId").equals(course.id).toArray();

        if(!retrievedUnits?.length) {
            console.warn("No units found for course. Creating units...");
            retrievedUnits = await createNewUnits(course);
            console.log("Units created and loaded to database: ", retrievedUnits);
        }

        setUnitCompletions(await getCompletedUnits(retrievedUnits));

        setUnits(retrievedUnits);
    };

    const { loading: loadingCourse, wrapped: retreiveCourse } = useAsyncLoading(_retreiveCourse);
    const { loading: loadingUnits, wrapped: retreiveUnits } = useAsyncLoading(_retreiveUnits);
    const loadingContent = loadingCourse || loadingUnits || !course;

    useEffect(() => {
        if(courseId) {
            if(ranOnLoad.current) return;
            ranOnLoad.current = true;

            retreiveCourse(parseInt(courseId));
        }
    }, [courseId]);

    useEffect(() => {
        if(course) {
            retreiveUnits(course);
        };
    }, [course]);
    
    return loadingContent ? PageLoading({ message: "Loading course content..." }) : (
        <div className="flex flex-col items-stretch gap-4">
            <div className="flex flex-col items-start gap-4">
                <Button
                    label="Back to Plan of Study"
                    onClick={() => navigate("/plan-of-study")}
                    icon="pi pi-chevron-left"
                />
            </div>
            <Section title={getCourseLabel(course)} subtitle={course?.description}>
                <h2 className="m-4">Curriculum</h2>
                <Stepper
                    orientation="vertical"
                    activeStep={activeStep}
                    onChangeStep={handleStepChange}
                    >
                    {units.map((unit) => (
                        <StepperPanel
                            key={unit.id}
                            header={unit.name}
                            pt={{number: {
                                    className: `unit-number ${unitCompletions.get(unit.id) ? "complete" : ""}`
                            }}}
                        >
                            <div className="p-4">
                                <h1>{unit.name}</h1>
                                <UnitPreview unit={unit} />
                            </div>
                        </StepperPanel>
                    ))}
                </Stepper>
            </Section>
        </div>
    );
}

export default CoursePage;