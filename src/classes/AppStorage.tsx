// This class handles the storage and retrieval of user preferences and settings for the AGU application. It uses the browser's localStorage API to persist data across sessions.

import type Course from "./Course/Course";
import type { Unit } from "./Course/Unit";
import type { User } from "./User";

export default class AppStorage {
    // USER
    static saveUser(user: User) {
        localStorage.setItem("agu_user", JSON.stringify(user));
    }
    static getUser(): User | null {
        const user = localStorage.getItem("agu_user");
        return user ? JSON.parse(user) : null;
    }
    static updateUserApiKey(apiKey: string) {
        const user = this.getUser();
        if (user) {
            user.apiKey = apiKey;
            this.saveUser(user);
        }
    }
    static markRateLimitHit() {
        const user = this.getUser();
        if (user) {
            user.hitRateLimit = true;
            this.saveUser(user);
        }
    }
    // COURSES
    static saveCourses(courses: Course[]) {
        localStorage.setItem("agu_courses", JSON.stringify(courses));
    }
    static getCourses(): Course[] | null {
        const courses: Course[] | null = JSON.parse(localStorage.getItem("agu_courses") || "null");
        return courses ? courses : null;
    }
    static addCourseUnits(course: Course, units: Unit[]) {
        const courses = this.getCourses();
        if (courses) {
            const index = courses.findIndex(c => c.name === course.name);
            if (index !== -1) {
                courses[index].units = units;
                this.saveCourses(courses);
            }
        }
    }
    // UNITS
    static getCourseUnits(courseIndex: number): Unit[] | null {
        const courses = this.getCourses();
        if (courses) {
            const foundCourse = courses[courseIndex];
            return foundCourse?.units || null;
        }
        return null;
    }
    // READINGS
    static addReadingContent(courseIndex: number, unitIndex: number, readingIndex: number, content: string[]) {
        const courses = this.getCourses();
        const course = courses ? courses[courseIndex] : null;
        const unit = course?.units ? course.units[unitIndex] : null;
        const reading = unit?.readings ? unit.readings[readingIndex] : null;
        if (reading) {
            reading.content = content;
            this.saveCourses(courses || []);
        }
    }
    static markReadingAsRead(courseIndex: number, unitIndex: number, readingIndex: number) {
        const courses = this.getCourses();
        const course = courses ? courses[courseIndex] : null;
        const unit = course?.units ? course.units[unitIndex] : null;
        const reading = unit?.readings ? unit.readings[readingIndex] : null;
        if (reading) {
            reading.read = true;
            this.saveCourses(courses || []);
        }
    }
};