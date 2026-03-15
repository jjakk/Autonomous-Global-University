import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "primereact/progressbar";
import { getCourseLabel, getGreeting, getPlanOfStudyProgress } from "../utils";
import { useNavigate } from "react-router-dom";
import { aguDb, type Course, type User, type Year } from "../classes/AguDatabase";
import ChatAgent from "../classes/ChatAgent";
import { useAsyncLoading } from "../hooks";
import { PageLoading } from "../components/PageLoading";
import { Knob } from "primereact/knob";
import { TabPanel, TabView } from "primereact/tabview";
import Section from "../components/Section";

function PlanOfStudyPage() {
    const navigate = useNavigate();
    const ranOnLoad = useRef(false);

    const [user, setUser] = useState<User | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [academicYears, setAcademicYears] = useState<Year[]>([]);
    const [planOfStudyProgress, setPlanOfStudyProgress] = useState<number>(0);

    const createAcademicYears = async (): Promise<Year[]> => {
        const yearsToBulkAdd: Omit<Year, "id">[] = [
            { name: "Freshman Year", index: 1 },
            { name: "Sophomore Year", index: 2 },
            { name: "Junior Year", index: 3 },
            { name: "Senior Year", index: 4 },
        ];
        await aguDb.years.bulkAdd(yearsToBulkAdd as Year[]);
        const yearsInDb = await aguDb.years.toArray();

        return yearsInDb;
    };

    const createPlanOfStudy = async (years: Year[]): Promise<Course[]> => {
        // Create the plan of study using the ChatAgent
        const user: User = await aguDb.getUser();
        const agent = new ChatAgent(user.apiKey);

        const coursesToBulkAdd: Partial<Course>[] = await agent.createPlanOfStudy(user.major, years);
        await aguDb.courses.bulkAdd(coursesToBulkAdd as Course[]);
        const courses: Course[] = await aguDb.courses.toArray();

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
        let yearsInDb: Year[] = await aguDb.years.toArray();

        if(!yearsInDb.length) {
            console.warn("No academic years found in database, creating default academic years...");
            yearsInDb = await createAcademicYears();
            console.log("Academic years created and loaded to database: ", yearsInDb);
        }
        
        if(!coursesInDb.length) {
            console.warn("No courses found in database, creating plan of study...");
            coursesInDb = await createPlanOfStudy(yearsInDb);
            console.log("Plan of study created and loaded to database: ", coursesInDb);
        }
        
        setAcademicYears(yearsInDb);
        setCourses(coursesInDb);
    }
    const _retreivePlanOfStudyProgress = async (): Promise<void> => {
        const psp = await getPlanOfStudyProgress();
        setPlanOfStudyProgress(psp);
    }

    const { loading: loadingPlanOfStudyProgress, wrapped: retreivePlanOfStudyProgress } = useAsyncLoading(_retreivePlanOfStudyProgress);
    const { loading: loadingUser, wrapped: retreiveUser } = useAsyncLoading(_retreiveUser);
    const { loading: loadingCourses, wrapped: retreiveCourses } = useAsyncLoading(_retreiveCourses);
    const loading = loadingPlanOfStudyProgress || loadingUser || loadingCourses || !user;
    
    useEffect(() => {
        if(ranOnLoad.current) return;
        ranOnLoad.current = true;
        
        retreiveUser();
        retreiveCourses();
        retreivePlanOfStudyProgress();
    }, []);

    return loading ? PageLoading({ message: "Creating your personalized plan of study..." }) : (
        <div className="flex flex-col items-start gap-4">
            <h1 className="m-2">{getGreeting(user.firstName)}</h1>
            <div className="flex flex-row gap-10 items-start">
                <Section title="Plan of Study" className="flex-3">
                    <TabView>
                        {academicYears.map((year: Year) => (
                            <TabPanel key={year.name} header={year.name}>
                                {courses.filter((course) => course.yearId === year.id).map((course) => (
                                    <div key={course.name} className="flex justify-content-between align-items-center gap-5 mb-3" >
                                        <div className="flex-1">
                                            <h2>
                                                <a onClick={() => navigate(`/course/${course.id}`)} className="cursor-pointer text-blue-900 hover:underline">{getCourseLabel(course)}</a>
                                            </h2>
                                            <h4 className="m-4">{course.description}</h4>
                                        </div>
                                    </div>
                                ))}
                            </TabPanel>
                        ))}
                    </TabView>
                </Section>
                <div className="flex flex-col flex-2 gap-10">
                    <Section title="Course of Study Progress" centerTitle>
                        <div className="flex flex-col flex-1 items-center gap-5 mt-5">
                            <Knob
                                value={planOfStudyProgress}
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