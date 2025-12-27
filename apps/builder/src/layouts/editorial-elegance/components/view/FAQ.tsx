import { useState } from "react";

/**
 * FAQ - Minimal accordion with 4-6 questions, generous spacing
 * Visually restrained, useful but minimal
 */
function FAQ({ _translations, _currentLang, config = {} }) {
  const faq = config.faq || {};
  const questions = faq.questions || [];
  const [openIndex, setOpenIndex] = useState(null);

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
                className="ee-faq-question"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                {item.question || ""}
                <span className="ee-faq-toggle">{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && item.answer && (
                <div className="ee-faq-answer">
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
