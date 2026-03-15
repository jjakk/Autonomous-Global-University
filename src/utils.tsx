import { aguDb, type Course, type Reading, type Unit } from "./classes/AguDatabase";

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

export const getPlanOfStudyProgress = async (): Promise<number> => {
    const courses: Course[] = await aguDb.courses.toArray();
    return await getCoursesProgress(courses);
};

export const getYearProgresses = async (): Promise<Map<string, number>> => {
    const progressByYear = new Map<string, number>();
    const years = await aguDb.years.toArray();

    for (const year of years) {
        const courses: Course[] = await aguDb.courses.where("yearId").equals(year.id).toArray();
        progressByYear.set(year.name, await getCoursesProgress(courses));
    }

    return progressByYear;
};

export const getCompletedUnits = async (units: Unit[]): Promise<Map<number, boolean>> => {
    const unitCompletionMap = new Map<number, boolean>();
    
    for(const unit of units) {
        const readings = await aguDb.readings.where("unitId").equals(unit.id).toArray();
        const completedUnit = readings.length > 0 && readings.every(r => r.read);
        unitCompletionMap.set(unit.id, completedUnit);
    }

    return unitCompletionMap;
};

export const getCourseProgresses = async (courses: Course[]): Promise<Map<number, number>> => {
    const courseProgressMap = new Map<number, number>();
    
    for(const course of courses) {
        const units = await aguDb.units.where("courseId").equals(course.id).toArray();
        if(units.length === 0) {
            courseProgressMap.set(course.id, 0);
            continue;
        }

        let courseUnitCompletion = 0;

        for (const unit of units) {
            const readings: Reading[] = await aguDb.readings.where("unitId").equals(unit.id).toArray();
            if (readings.length === 0) continue;

            const readCount = readings.filter((reading: Reading) => reading.read === true).length;

            courseUnitCompletion += readCount / readings.length;
        }
        courseProgressMap.set(course.id, Math.floor((courseUnitCompletion / units.length) * 100));
    }
    
    return courseProgressMap;
}

export const getCoursesProgress = async (courses: Course[]): Promise<number> => {
    if(courses.length === 0) return 0;

    let courseCompleted = 0;
    let totalCourses = courses.length;

    for(const course of courses) {
        const units = await aguDb.units.where("courseId").equals(course.id).toArray();
        if(units.length === 0) continue;
        
        let courseUnitCompletion = 0;

        for (const unit of units) {
            const readings = await aguDb.readings.where("unitId").equals(unit.id).toArray();

            if (readings.length === 0) {
                courseUnitCompletion += 0; // unit is incomplete
                continue;
            }

            const readCount = readings.filter(
                (reading: any) => reading.read === true || reading.isRead === true
            ).length;

            courseUnitCompletion += readCount / readings.length;
        }

        courseCompleted += courseUnitCompletion / units.length;
    }

    return Math.floor((courseCompleted / totalCourses) * 100);
};
