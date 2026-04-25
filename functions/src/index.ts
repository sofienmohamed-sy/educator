import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "us-central1", maxInstances: 10 });

export { solveProblem } from "./solveProblem";
export { solveWriting } from "./solveWriting";
export { generateWriting } from "./generateWriting";
export { generateCourse } from "./generateCourse";
export { generateCourseStream } from "./generateCourseStream";
export { generateExercises } from "./generateExercises";
export { generateExercisesStream } from "./generateExercisesStream";
export { generateExam } from "./generateExam";
export { generateExamStream } from "./generateExamStream";
export { processBookOnUpload, processBook } from "./processBook";
export { updateProfile, getProfile } from "./profile";
export { createBook, listBooks } from "./books";
