import { useState } from "react";

interface FAQProps {
  _translations?: unknown;
  _currentLang?: string;
  config?: {
    faq?: {
      questions?: Array<{
        question: string;
        answer: string;
      }>;
    };
  };
}

/**
 * FAQ - Minimal accordion with 4-6 questions, generous spacing
 * Visually restrained, useful but minimal
 */
function FAQ({ _translations, _currentLang, config = {} }: FAQProps) {
  const faq = config.faq || {};
  const questions = faq.questions || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (questions.length === 0) {
    return null;
  }

  return (
    <section className="ee-section ee-faq-section">
      <div className="ee-faq-container">
        <h2 className="ee-section-heading">FAQ</h2>
        <div className="ee-divider" />

        <div className="ee-faq-list">
          {questions.map((item, index) => (
            <div key={index} className="ee-faq-item">
              <button
                type="button"
                id={`faq-question-${index}`}
                className="ee-faq-question"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                aria-label={
                  openIndex === index ? `Collapse: ${item.question}` : `Expand: ${item.question}`
                }
              >
                {item.question || ""}
                <span className="ee-faq-toggle">{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && item.answer && (
                <div
                  className="ee-faq-answer"
                  id={`faq-answer-${index}`}
                  aria-labelledby={`faq-question-${index}`}
                >
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
