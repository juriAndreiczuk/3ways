import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import AnalysisMatrixStage from "./AnalysisMatrixStage";
import { CategoryGlyph, getVisualCategory, type VisualCategoryId } from "./visualCategories";

const processingMessages = [
  "Analizujemy odpowiedzi",
  "Porównujemy dostępne kierunki",
  "Ustalamy poziom dopasowania",
] as const;

export default function ProcessingStage({
  categoryId,
  answerCount,
  courseCount,
  areaCount,
  onComplete,
}: {
  categoryId: VisualCategoryId;
  answerCount: number;
  courseCount: number;
  areaCount: number;
  onComplete: () => void;
}) {
  const [messageIndex, setMessageIndex] = useState(0);
  const progressRef = useRef<HTMLSpanElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const completedRef = useRef(false);
  const category = getVisualCategory(categoryId);

  useEffect(() => {
    const timeline = gsap.timeline({
      onComplete: () => {
        if (completedRef.current) return;
        completedRef.current = true;
        onComplete();
      },
    });
    timeline.fromTo(
      progressRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 4.1, ease: "none" },
    );
    timeline.call(() => setMessageIndex(1), [], 1.35);
    timeline.call(() => setMessageIndex(2), [], 2.72);
    return () => {
      timeline.kill();
    };
  }, [onComplete]);

  useEffect(() => {
    gsap.fromTo(
      messageRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
    );
  }, [messageIndex]);

  return (
    <section className="configurator configurator--processing" aria-live="polite">
      <div className="processing-category" style={{ color: category.cssColour }}>
        <CategoryGlyph categoryId={categoryId} size={24} />
        <span>Punkt wyjścia: {category.label}</span>
      </div>
      <AnalysisMatrixStage categoryId={categoryId} phase={messageIndex} />
      <p ref={messageRef} className="processing-message" key={messageIndex}>
        {processingMessages[messageIndex]}
      </p>
      <div className="processing-progress" aria-hidden="true">
        <span ref={progressRef} style={{ background: category.cssColour }} />
      </div>
      <p className="processing-caption">
        {answerCount} odpowiedzi · {courseCount} kierunków · {areaCount} obszarów
      </p>
    </section>
  );
}
