export type CategoryId = string;
export type CourseId = string;
export type QuestionId = string;
export type CourseTypeId = string;

export type QuestionType = "routing" | "scoring";
export type ScoreMap = Partial<Record<CourseId, number>>;

export interface Category {
  id: CategoryId;
  name: string;
}

export interface Course {
  id: CourseId;
  categoryId: CategoryId;
  name: string;
  link: string;
  price: number;
  amount: number;
}

export interface Answer {
  id: string;
  label: string;
  nextQuestionId?: QuestionId | null;
  scores: ScoreMap;
}

export interface Question {
  id: QuestionId;
  type: QuestionType;
  question: string;
  nextQuestionId?: QuestionId | null;
  answers: Answer[];
}

export interface ConfiguratorConfig {
  title: string;
  description: string;
  questionsPerSession: number;
  resultsLimit: number;
  primaryResultLabel: string;
  secondaryResultLabel: string;
  additionalResultLabel: string;
}

export interface ResultLogic {
  strategy: "highest_score";
  sort: "descending";
  primaryResult: number;
  alternativeResults: number;
  tieBreaker: "first_higher_score_from_routing_question";
}

export interface ResultTemplate {
  heading: string;
  primary: {
    label: string;
    categoryField: string;
    courseField: string;
  };
  alternatives: {
    label: string;
    count: number;
  };
  cta: {
    label: string;
    secondaryLabel: string;
  };
}

export interface CourseType {
  id: CourseTypeId;
  name: string;
  config: ConfiguratorConfig;
  categories: Category[];
  courses: Course[];
  questions: Question[];
  resultLogic: ResultLogic;
  resultTemplate: ResultTemplate;
}

export interface RootConfiguratorConfig {
  title: string;
  description: string;
  courseTypeSelectionTitle: string;
  courseTypes: CourseTypeId[];
}

export interface CourseConfiguratorData {
  config: RootConfiguratorConfig;
  courseTypes: CourseType[];
}

export interface RankedCourse {
  course: Course;
  category: Category;
  score: number;
}

export interface QuizResult {
  primary: RankedCourse;
  alternatives: RankedCourse[];
}
