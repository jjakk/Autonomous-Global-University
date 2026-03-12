import type { Course, User } from "./AguDatabase";
import AppStorage from "./AppStorage";

export default class AppAuth {
    static isAuthenticated(): boolean {
        const user: User | null = AppStorage.getUser();
        const courses: Course[] | null = AppStorage.getCourses();
        return !!user && !!courses;
    }
}