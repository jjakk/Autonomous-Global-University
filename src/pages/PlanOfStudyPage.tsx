import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "primereact/progressbar";
import { getCourseLabel, getCourseProgresses, getGreeting, getPlanOfStudyProgress, getYearProgresses } from "../utils";
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
    const [yearProgresses, setYearProgresses] = useState<Map<string, number>>(new Map());
    const [courseProgresses, setCourseProgresses] = useState<Map<number, number>>(new Map());

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
    const _retreiveProgresses = async (): Promise<void> => {
        setPlanOfStudyProgress(await getPlanOfStudyProgress());
        setYearProgresses(await getYearProgresses());
        setCourseProgresses(await getCourseProgresses(courses));
    }

    // console.log(courseProgresses);

    const { loading: loadingPlanOfStudyProgress, wrapped: retreiveProgresses } = useAsyncLoading(_retreiveProgresses);
    const { loading: loadingUser, wrapped: retreiveUser } = useAsyncLoading(_retreiveUser);
    const { loading: loadingCourses, wrapped: retreiveCourses } = useAsyncLoading(_retreiveCourses);
    const loading = loadingPlanOfStudyProgress || loadingUser || loadingCourses || !user;
    
    useEffect(() => {
        if(ranOnLoad.current) return;
        ranOnLoad.current = true;
        
        retreiveUser();
        retreiveCourses();
    }, []);

    useEffect(() => {
        if(courses.length > 0) {
            retreiveProgresses();
        }
    }, [courses]);

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
                                            <div className="flex align-items-center gap-3">
                                                <Knob
                                                    value={courseProgresses.get(course.id) ?? 0}
                                                    size={35}
                                                    showValue={false}
                                                    readOnly
                                                />
                                                <h2 className="m-0 p-0"><a onClick={() => navigate(`/course/${course.id}`)} className="cursor-pointer text-blue-900 hover:underline">{getCourseLabel(course)}</a></h2>
                                            </div>
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
                            {yearProgresses.size > 0 && Array.from(yearProgresses.entries()).map(([yearName, progress]) => (
                                <div key={yearName} className="flex flex-col gap-2">
                                    <span>{yearName}</span>
                                    <ProgressBar value={progress} showValue={false} />
                                    <p className="self-end">{progress.toFixed(2)}% completed</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                    {/* <Section title="Upcoming Assignments">
                    </Section> */}
                </div>
            </div>
        </div>
    );
};

export default PlanOfStudyPage;