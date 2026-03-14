import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "primereact/progressbar";
import { getCourseLabel, getGreeting } from "../utils";
import { useNavigate } from "react-router-dom";
import { aguDb, type Course, type User } from "../classes/AguDatabase";
import ChatAgent from "../classes/ChatAgent";
import { useAsyncLoading } from "../hooks";
import { PageLoading } from "../components/PageLoading";
import { Knob } from "primereact/knob";
import { TabPanel, TabView } from "primereact/tabview";
import Section from "../components/Section";

function CoursesRender({ courses, startIndex, endIndex }: { courses: Course[], startIndex: number, endIndex: number }) {
    const navigate = useNavigate();

    return (
        <div>
        {
            courses.map((course, index) => (index >= startIndex && index < endIndex) ? (
                <div key={course.name} className="flex justify-content-between align-items-center gap-5 mb-3" >
                    <div className="flex-1">
                        <h2>
                            <a onClick={() => navigate(`/course/${course.id}`)} className="cursor-pointer text-blue-900 hover:underline">{getCourseLabel(course)}</a>
                        </h2>
                        <h4 className="m-4">{course.description}</h4>
                    </div>
                    {/* <div className="flex-1">
                        <div className="mb-2">
                            <ProgressBar
                                // value={evalCourseProgress(course)}
                                value={0}
                            ></ProgressBar>
                        </div>
                        <span className="text-sm text-muted">Complete</span>
                    </div> */}
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
        <div className="flex flex-col items-start gap-4">
            <h1 className="m-2">{getGreeting(user.firstName)}</h1>
            <div className="flex flex-row gap-10 items-start">
                <Section title="Plan of Study" className="flex-3">
                    <TabView>
                        {["Freshman", "Sophomore", "Junior", "Senior"].map((year, i) => (
                            <TabPanel key={year} header={year + " Year"}>
                                <CoursesRender courses={courses} startIndex={(i * courses.length) / 4} endIndex={((i + 1) * courses.length) / 4} />
                            </TabPanel>
                        ))}
                    </TabView>
                </Section>
                <div className="flex flex-col flex-2 gap-10">
                    <Section title="Course of Study Progress" centerTitle>
                        <div className="flex flex-col flex-1 items-center gap-5 mt-5">
                            <Knob
                                value={10}
                                size={150}
                                valueTemplate={'{value}%'}
                                readOnly
                            />
                        </div>
                        <div className="flex-1-gray-100 p-5 border-round">
                            <h3 className="m-2">Freshman Year</h3>
                            <ProgressBar
                                value={20}
                            ></ProgressBar>
                            <h3 className="m-2">Sophomore Year</h3>
                            <ProgressBar
                                value={0}
                            ></ProgressBar>
                            <h3 className="m-2">Junior Year</h3>
                            <ProgressBar
                                value={0}
                            ></ProgressBar>
                            <h3 className="m-2">Senior Year</h3>
                            <ProgressBar
                                value={0}
                            ></ProgressBar>
                        </div>
                    </Section>
                    <Section title="Upcoming Assignments">
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default PlanOfStudyPage;