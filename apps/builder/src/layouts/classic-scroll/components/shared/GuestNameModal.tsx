import { useEffect, useState } from "react";

function GuestNameModal({ isOpen, onClose, translations, _currentLang }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const storedName = localStorage.getItem("wedding-guest-name") || "";
    const storedTitle = localStorage.getItem("wedding-guest-title") || "";
    // Initialize state from localStorage - this is acceptable for initialization
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(storedName);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(storedTitle);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    localStorage.setItem("wedding-guest-name", name.trim());
    if (title.trim()) {
      localStorage.setItem("wedding-guest-title", title.trim());
    } else {
      localStorage.removeItem("wedding-guest-title");
    }
    window.dispatchEvent(new Event("guestNameUpdated"));
    onClose();
  };

  return (
    <div className="guest-modal active">
      <div className="guest-modal-content">
        <div className="guest-modal-title" id="guestNameTitle">
          {translations["guest.title"] || "Add Your Name"}
        </div>
        <div className="guest-modal-subtitle" id="guestNameSubtitle">
          {translations["guest.subtitle"] ||
            "We would love to address this invitation to you personally. Please tell us your name."}
        </div>
        <form id="guestNameForm" onSubmit={handleSubmit}>
          <select
            id="guestTitleSelect"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="guest-modal-input"
            style={{ marginBottom: "8px" }}
          >
            <option value="">Title (optional)</option>
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Miss">Miss</option>
          </select>
          <input
            type="text"
            id="guestNameInput"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={translations["guest.placeholder"] || "Enter your name"}
            className="guest-modal-input"
            autoComplete="name"
            required
          />
          <div className="guest-modal-actions">
            <button type="button" className="btn btn-ghost" id="guestNameSkip" onClick={onClose}>
              {translations["guest.skip"] || "Skip"}
            </button>
            <button type="submit" className="btn btn-primary" id="guestNameSave">
              {translations["guest.save"] || "Save Name"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GuestNameModal;
