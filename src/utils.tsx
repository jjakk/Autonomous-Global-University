import type { Course } from "./classes/AguDatabase";

export const calculateCourseCode = (index: number): number => {
    return parseInt(`${Math.ceil((index + 2) / 10)}0${(index+1) % 10}`);
}

export const getCourseLabel = (course: Course, index: number): string => {
    const courseCode = calculateCourseCode(index);
    return `Course ${courseCode}: ${course.name}`;
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
