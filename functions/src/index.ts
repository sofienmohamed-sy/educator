import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "us-central1", maxInstances: 10 });

export { solveProblem } from "./solveProblem";
export { solveWriting } from "./solveWriting";
export { generateWriting } from "./generateWriting";
export { generateCourse } from "./generateCourse";
export { generateExercises } from "./generateExercises";
export { generateExam } from "./generateExam";
export { processBookOnUpload, processBook } from "./processBook";
export { updateProfile, getProfile } from "./profile";
export { createBook, listBooks } from "./books";
