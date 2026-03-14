import { useEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { ProgressBar } from "primereact/progressbar";
import { getCourseLabel } from "../utils";
import { useNavigate } from "react-router-dom";
import { aguDb, type Course, type User } from "../classes/AguDatabase";
import ChatAgent from "../classes/ChatAgent";
import { ProgressSpinner } from "primereact/progressspinner";
import { useAsyncLoading } from "../hooks";

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
                                // value={evalCourseProgress(course)}
                                value={0}
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

    const createPlanOfStudy = async (): Promise<Course[]> => {
        // Create the plan of study using the ChatAgent
        const user: User = await aguDb.getUser();
        const agent = new ChatAgent(user.apiKey);
        
        const courses: Course[] = await agent.createPlanOfStudy(user.major);
        await aguDb.courses.bulkAdd(courses);

        return courses;
    };

    const _retreiveCourses = async (): Promise<void> => {
        let coursesInDb: Course[] = await aguDb.courses.toArray();

        if(!coursesInDb.length) {
            console.warn("No courses found in database, creating plan of study...");
            coursesInDb = await createPlanOfStudy();
            console.log("Plan of study created and loaded to database: ", coursesInDb);
        }

        setCourses(coursesInDb);
    }
    const { loading, wrapped: retreiveCourses } = useAsyncLoading(_retreiveCourses);
    
    useEffect(() => { retreiveCourses(); }, []);

    return (
        <div className="home-page">
            {loading ? (
                <div className="flex flex-col items-center gap-4">
                    <h2 className="m-2">Creating your personalized plan of study...</h2>
                    <ProgressSpinner />
                </div>
            ) : (
                <div>
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
            )}
        </div>
    );
};

export default PlanOfStudyPage;