import "./PlanOfStudyPage.scss"
import { useEffect, useState } from "react";
import type Course from "../classes/Course/Course";
import AppStorage from "../classes/AppStorage";
import { Accordion, AccordionTab } from "primereact/accordion";
import { ProgressBar } from "primereact/progressbar";
import { evalCourseProgress, getCourseLabel } from "../utils";
import { useNavigate } from "react-router-dom";

function CoursesRender({ courses, startIndex, endIndex }: { courses: Course[], startIndex: number, endIndex: number }) {
    const navigate = useNavigate();

    return (
        <div>
        {
            courses.map((course, index) => (index >= startIndex && index < endIndex) ? (
                <div key={index} >
                    <div className="course-header">
                        <h2 className="course-header-text">
                            <a onClick={() => navigate(`/course/${index}`)}>{getCourseLabel(course, index)}</a>
                        </h2>
                        <div className="course-header-progress">
                            <div className="course-header-progress-bar">
                                <ProgressBar
                                    value={evalCourseProgress(course)}
                                ></ProgressBar>
                            </div>
                            <span className="course-header-progress-text">Complete</span>
                        </div>
                    </div>
                    <div className="course-content">
                        <h4>{course.description}</h4>
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
            const crs: Course[] | null = AppStorage.getCourses();
            if(crs) {
                setCourses(crs);
            }
        })();
    }, []);

    return (
        <div className="home-page">
            <h1>Welcome to Autonomous Global University!</h1>
            {/* <ProgressBar
                value={evalPlanOfStudyProgress(courses)}
            ></ProgressBar> */}
            <h2>Your Plan of Study:</h2>
            <Accordion>
                {["Freshman", "Sophomore", "Junior", "Senior"].map((year, i) => (
                    <AccordionTab header={year + " Year"}>
                        <CoursesRender courses={courses} startIndex={(i * courses.length) / 4} endIndex={((i + 1) * courses.length) / 4} />
                    </AccordionTab>
                ))}
            </Accordion>
        </div>
    );
};

export default PlanOfStudyPage;