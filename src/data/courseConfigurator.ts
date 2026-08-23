import rawConfigurator from "../content/configurator.json";
import type {
  Answer,
  CourseConfiguratorData,
  CourseType,
  CourseTypeId,
  Question,
  QuestionId,
  RankedCourse,
  QuizResult,
  ScoreMap,
} from "../types/courseConfigurator";

export const courseConfigurator = rawConfigurator as CourseConfiguratorData;

const courseTypesById = new Map(
  courseConfigurator.courseTypes.map((courseType) => [courseType.id, courseType]),
);

export function getCourseType(courseTypeId: CourseTypeId): CourseType {
  const courseType = courseTypesById.get(courseTypeId);

  if (!courseType) {
    throw new Error(`Unknown configurator course type: ${courseTypeId}`);
  }

  return courseType;
}

export function getFirstQuestionId(courseTypeId: CourseTypeId): QuestionId | null {
  return getCourseType(courseTypeId).questions[0]?.id ?? null;
}

export function getQuestion(
  courseTypeId: CourseTypeId,
  questionId: QuestionId,
): Question {
  const question = getCourseType(courseTypeId).questions.find(
    (candidate) => candidate.id === questionId,
  );

  if (!question) {
    throw new Error(`Unknown configurator question: ${questionId}`);
  }

  return question;
}

export function getQuestionPathLength(
  courseTypeId: CourseTypeId,
  startingQuestionId: QuestionId | null,
): number {
  const courseType = getCourseType(courseTypeId);
  const questionsById = new Map(
    courseType.questions.map((question) => [question.id, question]),
  );
  const visited = new Set<QuestionId>();
  let questionId = startingQuestionId;
  let length = 0;

  while (questionId && !visited.has(questionId)) {
    visited.add(questionId);
    const question = questionsById.get(questionId);
    if (!question) break;
    length += 1;
    questionId = question.nextQuestionId ?? null;
  }

  return length;
}

export function resolveNextQuestionId(
  question: Question,
  answer: Answer,
): QuestionId | null {
  return answer.nextQuestionId ?? question.nextQuestionId ?? null;
}

export function addScores(current: ScoreMap, added: ScoreMap): ScoreMap {
  const nextScores: ScoreMap = { ...current };

  for (const [courseId, points] of Object.entries(added)) {
    nextScores[courseId] = (nextScores[courseId] ?? 0) + (points ?? 0);
  }

  return nextScores;
}

export function calculateRankedCourses(
  courseTypeId: CourseTypeId,
  scores: ScoreMap,
  routingScores: ScoreMap,
): RankedCourse[] {
  const courseType = getCourseType(courseTypeId);
  const categoriesById = new Map(
    courseType.categories.map((category) => [category.id, category]),
  );
  return courseType.courses
    .map((course, originalIndex) => {
      const category = categoriesById.get(course.categoryId);

      if (!category) {
        throw new Error(`Unknown category for course: ${course.id}`);
      }

      return {
        course,
        category,
        score: scores[course.id] ?? 0,
        routingScore: routingScores[course.id] ?? 0,
        originalIndex,
      };
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.routingScore - left.routingScore ||
        left.originalIndex - right.originalIndex,
    )
    .map(({ course, category, score }) => ({ course, category, score }));
}

export function calculateResult(
  courseTypeId: CourseTypeId,
  scores: ScoreMap,
  routingScores: ScoreMap,
): QuizResult {
  const courseType = getCourseType(courseTypeId);
  const rankedCourses = calculateRankedCourses(
    courseTypeId,
    scores,
    routingScores,
  ).slice(0, courseType.config.resultsLimit);

  const [primary, ...alternatives] = rankedCourses;

  if (!primary) {
    throw new Error("The configurator must contain at least one course");
  }

  return {
    primary,
    alternatives: alternatives.slice(
      0,
      courseType.resultLogic.alternativeResults,
    ),
  };
}
