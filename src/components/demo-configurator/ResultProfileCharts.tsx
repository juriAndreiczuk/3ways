import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { CourseType, ScoreMap } from "../../types/courseConfigurator";
import { getVisualCategory, type VisualCategoryId } from "./visualCategories";

interface ResultProfileChartsProps {
  courseType: CourseType;
  selectedCategoryId: VisualCategoryId;
  scores: ScoreMap;
  profileQuestionIds: string[];
}

function sumCategoryScore(
  courseType: CourseType,
  scores: ScoreMap,
  categoryId: string,
): number {
  return courseType.courses.reduce(
    (total, course) =>
      course.categoryId === categoryId
        ? total + (scores[course.id] ?? 0)
        : total,
    0,
  );
}

function getMaximumCategoryScore(
  courseType: CourseType,
  questionIds: string[],
  categoryId: string,
): number {
  return questionIds.reduce((total, questionId) => {
    const question = courseType.questions.find(
      (candidate) => candidate.id === questionId,
    );
    if (!question) return total;

    const questionMaximum = Math.max(
      0,
      ...question.answers.map((answer) =>
        sumCategoryScore(courseType, answer.scores, categoryId),
      ),
    );

    return total + questionMaximum;
  }, 0);
}

export default function ResultProfileCharts({
  courseType,
  selectedCategoryId,
  scores,
  profileQuestionIds,
}: ResultProfileChartsProps) {
  const selectedVisual = getVisualCategory(selectedCategoryId);
  const categoryScores = courseType.categories.map((category) =>
    sumCategoryScore(courseType, scores, category.id),
  );
  const selectedCategoryIndex = courseType.categories.findIndex(
    (category) => category.id === selectedCategoryId,
  );
  const selectedScore =
    selectedCategoryIndex >= 0 ? categoryScores[selectedCategoryIndex] : 0;
  const selectedMaximum = getMaximumCategoryScore(
    courseType,
    profileQuestionIds,
    selectedCategoryId,
  );
  const agreement =
    selectedMaximum > 0
      ? Math.min(100, Math.round((selectedScore / selectedMaximum) * 100))
      : 0;
  const radarMaximum = Math.max(
    5,
    Math.ceil(Math.max(...categoryScores) / 5) * 5,
  );

  const donutOptions: ApexOptions = {
    chart: {
      type: "donut",
      background: "transparent",
      foreColor: "#aaa5bd",
      animations: { enabled: true, speed: 1100 },
      toolbar: { show: false },
    },
    labels: ["Zgodność", "Pozostała przestrzeń"],
    colors: [selectedVisual.cssColour, "#202139"],
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: {
      width: 1,
      colors: ["rgba(255,255,255,0.12)"],
    },
    states: {
      hover: { filter: { type: "lighten", value: 0.08 } },
      active: { filter: { type: "none" } },
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        offsetX: 0,
        offsetY: 0,
        customScale: 1,
        donut: {
          size: "76%",
          labels: { show: false },
        },
      },
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (value) => `${Math.round(value)}%` },
    },
  };

  const radarOptions: ApexOptions = {
    chart: {
      type: "radar",
      background: "transparent",
      foreColor: "#aaa5bd",
      animations: { enabled: true, speed: 1200 },
      toolbar: { show: false },
    },
    colors: [selectedVisual.cssColour],
    labels: courseType.categories.map((category) => category.name),
    stroke: { width: 2 },
    fill: { opacity: 0.2 },
    markers: {
      size: 4,
      strokeWidth: 1,
      strokeColors: "#090a1c",
      hover: { size: 6 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: courseType.categories.map((category) => category.name),
      labels: {
        show: true,
        style: {
          colors: courseType.categories.map(() => "#aaa5bd"),
          fontSize: "7px",
          fontWeight: 700,
        },
      },
    },
    yaxis: {
      min: 0,
      max: radarMaximum,
      tickAmount: 4,
      show: false,
    },
    plotOptions: {
      radar: {
        size: 104,
        polygons: {
          strokeColors: "rgba(143, 137, 180, 0.25)",
          connectorColors: "rgba(143, 137, 180, 0.18)",
          fill: {
            colors: ["rgba(255,255,255,0.012)", "rgba(255,255,255,0.025)"],
          },
        },
      },
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (value) => `${value} pkt` },
    },
  };

  return (
    <section
      className="result-profile"
      aria-labelledby="result-profile-title"
      style={
        { "--profile-colour": selectedVisual.cssColour } as React.CSSProperties
      }
    >
      <header className="result-profile__header">
        <p className="configurator__eyebrow">Analiza odpowiedzi</p>
        <h2 id="result-profile-title">Twój profil</h2>
        <p>
          Zobacz, jak Twoje odpowiedzi rozłożyły się na poszczególne obszary.
        </p>
      </header>

      <div className="result-profile__charts">
        <article className="result-profile__chart result-profile__chart--donut">
          <div className="result-profile__chart-heading">
            <div>
              <strong>{selectedVisual.label}</strong>
            </div>
            <small>
              {selectedScore} z {selectedMaximum} pkt
            </small>
          </div>
          <div className="result-profile__donut-shell">
            <ReactApexChart
              type="donut"
              series={[agreement, Math.max(0, 100 - agreement)]}
              options={donutOptions}
              width="100%"
              height={260}
            />
            <div className="result-profile__donut-value" aria-hidden="true">
              <strong>{agreement}%</strong>
              <span>zgodność z wybranym obszarem</span>
            </div>
          </div>
        </article>

        <article className="result-profile__chart result-profile__chart--radar">
          <div className="result-profile__chart-heading">
            <div>
              <strong>Profil zainteresowań</strong>
            </div>
            <small>Wyniki wszystkich pytań</small>
          </div>
          <ReactApexChart
            type="radar"
            series={[{ name: "Punkty", data: categoryScores }]}
            options={radarOptions}
            height={300}
          />
        </article>
      </div>
    </section>
  );
}
