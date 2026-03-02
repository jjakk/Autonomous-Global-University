import { Button } from "primereact/button";
import "./Layout.scss";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { OverlayPanel } from "primereact/overlaypanel";
import { useEffect, useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import AppStorage from "../classes/AppStorage";
import type Course from "../classes/Course/Course";
import { ScrollPanel } from "primereact/scrollpanel";
import { InputTextarea } from "primereact/inputtextarea";
import AppAuth from "../classes/AppAuth";


function AppHeader() {
    let { courseIndex } = useParams();
    const op = useRef<OverlayPanel>(null);
    const [taCourse, setTaCourse] = useState<Course | null>(null);
    const courses = AppStorage.getCourses() || [];

    useEffect(() => {
        if(courseIndex && courses.length > 0) {
            const index = parseInt(courseIndex);
            if(!isNaN(index) && index >= 0 && index < courses.length) {
                setTaCourse(courses[index]);
            }
        }
    }, [courseIndex]);

    return (
        <header className="nav-header">
            <div className="nav-header-left">
                <NavLink to="/">
                    <img src="./logo.png" alt="logo" className="nav-header-logo" />
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
                        <Dropdown value={taCourse} onChange={(e) => setTaCourse(e.value)} options={courses} optionLabel="name" placeholder="Select a Course" className="w-full md:w-14rem" />
                        {taCourse && (
                            <div>
                                <ScrollPanel style={{ width: '100%', height: '200px' }}>
                                    <div className="ta-chat-history">
                                        <p className="chat-bubble ta-response">Hey, I'll be your TA for {taCourse.name}, let me know if you have any questions!</p>
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