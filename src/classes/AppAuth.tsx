export default class AppAuth {
    static login() {
        localStorage.setItem("logged_in", "true");
    }
    static logout() {
        localStorage.removeItem("logged_in");
    }
    static isAuthenticated(): boolean {
        return localStorage.getItem("logged_in") === "true";
    }
}