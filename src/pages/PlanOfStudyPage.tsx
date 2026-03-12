import { useEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { ProgressBar } from "primereact/progressbar";
import { evalCourseProgress, getCourseLabel } from "../utils";
import { useNavigate } from "react-router-dom";
import { aguDb, type Course } from "../classes/AguDatabase";

function CoursesRender({ courses, startIndex, endIndex }: { courses: Course[], startIndex: number, endIndex: number }) {
    const navigate = useNavigate();

    return (
        <div>
        {
            courses.map((course, index) => (index >= startIndex && index < endIndex) ? (
                <div key={course.id} className="flex justify-content-between align-items-center gap-5 mb-3" >
                    <div className="flex-1">
                        <h2>
                            <a onClick={() => navigate(`/course/${course.id}`)} className="cursor-pointer text-blue-900 hover:underline">{getCourseLabel(course, index)}</a>
                        </h2>
                        <h4 className="m-4">{course.description}</h4>
                    </div>
                    <div className="flex-1">
                        <div className="mb-2">
                            <ProgressBar
                                value={evalCourseProgress(course)}
                            ></ProgressBar>
                        </div>
                        <span className="text-sm text-muted">Complete</span>
                    </div>
                </div>
            ) : null)
        }
        </div>
    );
}

function PlanOfStudyPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    
    useEffect(() => {
        (async function() {
            const crs: Course[] | null = await aguDb.courses.toArray();
            if(crs) {
                setCourses(crs);
            }
        })();
    }, []);

    return (
        <div className="home-page">
            <h1 className="m-2">Welcome to Autonomous Global University!</h1>
            <h2 className="m-4">Your Plan of Study:</h2>
            <Accordion>
                {["Freshman", "Sophomore", "Junior", "Senior"].map((year, i) => (
                    <AccordionTab key={i} header={year + " Year"}>
                        <CoursesRender courses={courses} startIndex={(i * courses.length) / 4} endIndex={((i + 1) * courses.length) / 4} />
                    </AccordionTab>
                ))}
            </Accordion>
        </div>
    );
};

export default PlanOfStudyPage;