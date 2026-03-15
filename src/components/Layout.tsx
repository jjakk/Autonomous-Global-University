import { Button } from "primereact/button";
import "./Layout.scss";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { OverlayPanel } from "primereact/overlaypanel";
import { useEffect, useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { ScrollPanel } from "primereact/scrollpanel";
import { InputTextarea } from "primereact/inputtextarea";
import AppAuth from "../classes/AppAuth";
import { aguDb, type Course } from "../classes/AguDatabase";
import { useAsyncLoading } from "../hooks";
import { getCourseLabel } from "../utils";

function AppHeader() {
    let { courseId } = useParams();
    const op = useRef<OverlayPanel>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

    const _updateCourseSelection = async (courseId: string) => {
        const ac: Course[] = await aguDb.courses.toArray();
        setAvailableCourses(ac);
        if(courseId && ac.length > 0) {
            const courseFound: Course | null = ac.find(c => c.id == parseInt(courseId)) || null;
            setSelectedCourse(courseFound);
        }
    };
    const { loading, wrapped: updateCourseSelection } = useAsyncLoading(_updateCourseSelection);

    useEffect(() => {
        if(courseId) {
            updateCourseSelection(courseId);
        }
    }, [courseId]);

    return (
        <header className="nav-header">
            <link rel="icon" type="image/svg+xml" href="/logo.png" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>AGU</title>
            <div className="nav-header-left">
                <NavLink to="/">
                    <img src="/logo.png" alt="logo" className="nav-header-logo" />
                </NavLink>
                <div className="nav-header-text">
                    <h1>Autonomous Global</h1>
                    <h1>University</h1>
                    <h3>Education for All</h3>
                </div>
            </div>
            {AppAuth.isAuthenticated() ? (
                <div className="nav-header-right">
                    <Button type="button" icon="pi pi-info-circle" label="Teaching Assistant" onClick={(e) => op.current?.toggle(e)} />
                    <OverlayPanel ref={op} dismissable={false} className="ta-interaction-box">
                        <Dropdown
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.value)}
                            options={availableCourses}
                            optionLabel="name"
                            itemTemplate={(option) => (<>{getCourseLabel(option)}</>)}
                            valueTemplate={(option) => (<>{getCourseLabel(option)}</>)}
                            placeholder={loading ? "Loading..." : "Select a Course"}
                            className="w-full md:w-14rem"
                            disabled={loading}
                        />
                        {selectedCourse && (
                            <div>
                                <ScrollPanel style={{ width: '100%', height: '200px' }}>
                                    <div className="ta-chat-history">
                                        <p className="chat-bubble ta-response">Hey, I'll be your TA for {selectedCourse.name}, let me know if you have any questions!</p>
                                        {/* <p className="chat-bubble student-response">Example user response</p> */}
                                    </div>
                                </ScrollPanel>
                                <form className="ta-input-form" onSubmit={(e) => {
                                    e.preventDefault();
                                    // Handle question submission to TA here
                                }}>
                                    <InputTextarea placeholder="Ask a question" style={{ width: '100%' }} />
                                    <Button icon="pi pi-send" disabled />
                                </form>
                            </div>
                        )}
                    </OverlayPanel>
                </div>
            ) : (
                <></>
            )}
        </header>
    );
}

function AppFooter() {
    return (
        <footer className="app-footer">
            <p>&copy; 2026 Autonomous Global University. All rights reserved.</p>
        </footer>
    );
}

function Layout() {

    return (
        <>
            <AppHeader />
            <main className="outlet-container">
                <Outlet />
            </main>
            <AppFooter />
        </>
    );
}

export default Layout;