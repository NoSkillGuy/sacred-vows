import { useState } from "react";
import EditableText from "../shared/EditableText";

interface EditableFAQProps {
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
  onUpdate?: (path: string, value: unknown) => void;
}

/**
 * EditableFAQ - Accordion Q&A editor
 */
function EditableFAQ({ _translations, _currentLang, config = {}, onUpdate }: EditableFAQProps) {
  const faq = config.faq || {};
  const questions = faq.questions || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleAddQuestion = () => {
    const newQuestions = [...questions, { question: "", answer: "" }];
    if (onUpdate) {
      onUpdate("faq.questions", newQuestions);
    }
  };

  const handleUpdateQuestion = (index: number, field: string, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    if (onUpdate) {
      onUpdate("faq.questions", updated);
    }
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    if (onUpdate) {
      onUpdate("faq.questions", updated);
    }
  };

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
                  openIndex === index
                    ? `Collapse: ${item.question || "Question"}`
                    : `Expand: ${item.question || "Question"}`
                }
              >
                <EditableText
                  value={item.question || ""}
                  onUpdate={(path, value) => handleUpdateQuestion(index, "question", value)}
                  className="ee-faq-question-text"
                  tag="span"
                />
                <span className="ee-faq-toggle">{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && (
                <div
                  className="ee-faq-answer"
                  id={`faq-answer-${index}`}
                  aria-labelledby={`faq-question-${index}`}
                >
                  <EditableText
                    value={item.answer || ""}
                    onUpdate={(path, value) => handleUpdateQuestion(index, "answer", value)}
                    className="ee-faq-answer-text"
                    tag="p"
                    multiline={true}
                  />
                  <button
                    onClick={() => handleDeleteQuestion(index)}
                    className="ee-delete-button"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={handleAddQuestion} className="ee-add-button" type="button">
          + Add Question
        </button>
      </div>
    </section>
  );
}

export default EditableFAQ;
