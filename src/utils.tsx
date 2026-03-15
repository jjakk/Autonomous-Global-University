import type { Course } from "./classes/AguDatabase";

export const calculateCourseCode = (index: number): number => {
    return parseInt(`${Math.ceil((index + 1) / 10)}0${index % 10}`);
}

export const getCourseLabel = (course: Course): string => {
    return `Course ${course.code}: ${course.name}`;
}

export const getGreeting = (name: string) => {
    const now = new Date();
    const hour = now.getHours(); // Gets the hour in 24-hour format (0-23)

    const greeting = (hour >= 5 && hour < 12)
        ? "morning"
        : (hour >= 12 && hour < 18)
            ? "afternoon"
            : "evening";
            
    return `Good ${greeting}, ${name}!`;
}

// export const evalPlanOfStudyProgress = (courses: Course[] | null): number => {
//     if(!courses || courses.length === 0) return 0;
//     const courseProgresses = [];
//     for(const course of courses) {
//         courseProgresses.push(evalCourseProgress(course) / 100);
//     }
//     const totalProgress = courseProgresses.reduce((acc, curr) => acc + curr, 0);
//     const averageProgress = totalProgress / courses.length;

//     return Math.floor(averageProgress * 100);
// }

// export const evalCourseProgress = (course: Course | null): number => {
//     if(course?.units?.length === 0) return 0;
//     let completedReadings = 0;
//     let totalReadings = 0;
//     for(const unit of course?.units || []) {
//         for(const reading of unit.readings) {
//             if(reading.read) {
//                 completedReadings++;
//             }
//             totalReadings++;
//         }
//     }
//     return Math.floor((completedReadings / totalReadings) * 100);
// }

// export const evalUnitProgress = (unit: Unit): number => {
//     if(unit.readings.length === 0) return 0;
//     const completed = unit.readings.filter(r => r.read).length;
//     return Math.floor((completed / unit.readings.length) * 100);
// }
