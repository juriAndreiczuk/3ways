import ReactApexChart from "react-apexcharts";
import { useState } from "react";
import type { ApexOptions } from "apexcharts";
import type { RankedCourse } from "../../types/courseConfigurator";
import { getVisualCategory, type VisualCategoryId } from "./visualCategories";

interface MatchDuelChartProps {
  contenders: RankedCourse[];
  selectedCategoryId: VisualCategoryId;
}

const shorten = (value: string) =>
  value.length > 34 ? `${value.slice(0, 31).trimEnd()}…` : value;

export default function MatchDuelChart({
  contenders,
  selectedCategoryId,
}: MatchDuelChartProps) {
  const [scope, setScope] = useState<"category" | "all">("category");
  const [isAllCoursesExpanded, setIsAllCoursesExpanded] = useState(false);
  const categoryCourses = contenders.filter(
    (item) => item.category.id === selectedCategoryId,
  );
  const visibleCourses =
    scope === "category"
      ? categoryCourses
      : contenders
          .filter((item) => item.category.id !== selectedCategoryId)
          .slice(0, 3);
  if (!visibleCourses.length) return null;

  const selectedVisual = getVisualCategory(selectedCategoryId);
  const maximum = Math.max(...visibleCourses.map((item) => item.score), 1);
  const chartHeight = Math.max(160, visibleCourses.length * 48 + 20);
  const chartColours = visibleCourses.map((item) =>
    getVisualCategory(item.category.id as VisualCategoryId).cssColour,
  );
  const allCourseColours = contenders.map((item) =>
    getVisualCategory(item.category.id as VisualCategoryId).cssColour,
  );
  const allChartHeight = Math.max(220, contenders.length * 42 + 18);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: chartHeight,
      background: "transparent",
      foreColor: "#aaa5bd",
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 950,
        animateGradually: { enabled: true, delay: 220 },
      },
    },
    colors: scope === "category" ? [selectedVisual.cssColour] : chartColours,
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 0,
        barHeight: "52%",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 5,
      style: { colors: ["#f7f5ff"], fontSize: "10px", fontWeight: "700" },
      formatter: (value) => `${value} pkt`,
    },
    xaxis: {
      categories: visibleCourses.map((item) => shorten(item.course.name)),
      min: 0,
      max: maximum + Math.max(2, Math.ceil(maximum * 0.12)),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        minWidth: 250,
        maxWidth: 250,
        style: { colors: ["#e6e2f5"], fontSize: "9px", fontWeight: 650 },
      },
    },
    grid: {
      borderColor: "rgba(147, 137, 190, 0.16)",
      strokeDashArray: 4,
      padding: { top: -3, right: 44, bottom: -8, left: 5 },
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
    tooltip: {
      theme: "dark",
      y: { formatter: (value) => `${value} pkt dopasowania` },
    },
  };

  const allCoursesOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: allChartHeight,
      background: "transparent",
      foreColor: "#aaa5bd",
      toolbar: { show: false },
      animations: { enabled: true, speed: 800 },
    },
    colors: allCourseColours,
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "54%",
        borderRadius: 0,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 5,
      style: { colors: ["#f7f5ff"], fontSize: "10px", fontWeight: "700" },
      formatter: (value) => `${value} pkt`,
    },
    xaxis: {
      categories: contenders.map((item) => shorten(item.course.name)),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        minWidth: 250,
        maxWidth: 250,
        style: { colors: ["#e6e2f5"], fontSize: "10px", fontWeight: 650 },
      },
    },
    grid: {
      borderColor: "rgba(147, 137, 190, 0.16)",
      strokeDashArray: 4,
      padding: { top: -3, right: 44, bottom: -8, left: 5 },
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
    tooltip: {
      theme: "dark",
      y: { formatter: (value) => `${value} pkt dopasowania` },
    },
  };

  return (
    <section className="match-duel" aria-labelledby="match-duel-title">
      <header className="match-duel__header">
        <div>
          <p className="configurator__eyebrow">
            {scope === "category"
              ? "Top 3 kierunki dla Ciebie"
              : "Pozostałe kierunki dla Ciebie"}
          </p>
          <h2 id="match-duel-title" style={{ color: selectedVisual.cssColour }}>
            {scope === "category" ? selectedVisual.label : "Wszystkie obszary"}
          </h2>
        </div>
        <div className="match-duel__scope" role="group" aria-label="Zakres rankingu">
          <button
            type="button"
            className={scope === "category" ? "is-active" : ""}
            aria-pressed={scope === "category"}
            onClick={() => setScope("category")}
          >
            Wybrany obszar
          </button>
          <button
            type="button"
            className={scope === "all" ? "is-active" : ""}
            aria-pressed={scope === "all"}
            onClick={() => setScope("all")}
          >
            Pozostałe
          </button>
        </div>
      </header>
      <ReactApexChart
        type="bar"
        series={[{ name: "Dopasowanie", data: visibleCourses.map((item) => item.score) }]}
        options={options}
        height={chartHeight}
      />
      <button
        type="button"
        className="match-duel__all-button"
        aria-expanded={isAllCoursesExpanded}
        onClick={() => setIsAllCoursesExpanded((current) => !current)}
      >
        {isAllCoursesExpanded ? "Zwiń listę" : "Zobacz wszystko"}
      </button>

      <div
        className={`match-duel__all-accordion${isAllCoursesExpanded ? " is-expanded" : ""}`}
        aria-hidden={!isAllCoursesExpanded}
      >
        {isAllCoursesExpanded && (
          <div className="match-duel__all-chart">
            <p className="configurator__eyebrow">Wszystkie kierunki</p>
            <ReactApexChart
              type="bar"
              series={[{ name: "Dopasowanie", data: contenders.map((item) => item.score) }]}
              options={allCoursesOptions}
              height={allChartHeight}
            />
          </div>
        )}
      </div>
    </section>
  );
}
