import { useEffect, useRef, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { ProgressBar } from "primereact/progressbar";
import { getCourseLabel, getGreeting } from "../utils";
import { useNavigate } from "react-router-dom";
import { aguDb, type Course, type User } from "../classes/AguDatabase";
import ChatAgent from "../classes/ChatAgent";
import { useAsyncLoading } from "../hooks";
import { PageLoading } from "../components/PageLoading";

function CoursesRender({ courses, startIndex, endIndex }: { courses: Course[], startIndex: number, endIndex: number }) {
    const navigate = useNavigate();

    return (
        <div>
        {
            courses.map((course, index) => (index >= startIndex && index < endIndex) ? (
                <div key={course.name} className="flex justify-content-between align-items-center gap-5 mb-3" >
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
    const navigate = useNavigate();
    const ranOnLoad = useRef(false);

    const [courses, setCourses] = useState<Course[]>([]);
    const [user, setUser] = useState<User | null>(null);

    const createPlanOfStudy = async (): Promise<Course[]> => {
        // Create the plan of study using the ChatAgent
        const user: User = await aguDb.getUser();
        const agent = new ChatAgent(user.apiKey);
        
        const courses: Course[] = await agent.createPlanOfStudy(user.major);
        await aguDb.courses.bulkAdd(courses);

        return courses;
    };

    const _retreiveUser = async (): Promise<void> => {
        const user = await aguDb.getUser();
        if(!user) {
            alert("No user found in database. Please set up your profile to generate a personalized plan of study.");
            navigate("/get-started");
        } else {
            setUser(user);
        }
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

    const { loading: loadingUser, wrapped: retreiveUser } = useAsyncLoading(_retreiveUser);
    const { loading: loadingCourses, wrapped: retreiveCourses } = useAsyncLoading(_retreiveCourses);
    const loading = loadingUser || loadingCourses || !user;
    
    useEffect(() => {
        if(ranOnLoad.current) return;
        ranOnLoad.current = true;
        
        retreiveUser();
        retreiveCourses();
    }, []);

    return loading ? PageLoading({ message: "Creating your personalized plan of study..." }) : (
        <div>
            <h1 className="m-2">{getGreeting(user.firstName)}</h1>
            <h2 className="m-4">Your Plan of Study:</h2>
            <Accordion>
                {["Freshman", "Sophomore", "Junior", "Senior"].map((year, i) => (
                    <AccordionTab key={year} header={year + " Year"}>
                        <CoursesRender courses={courses} startIndex={(i * courses.length) / 4} endIndex={((i + 1) * courses.length) / 4} />
                    </AccordionTab>
                ))}
            </Accordion>
        </div>
    );
};

export default PlanOfStudyPage;