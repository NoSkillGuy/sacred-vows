import { useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';

function TranslationsForm() {
  const { currentInvitation } = useBuilderStore();
  const [activeLang, setActiveLang] = useState('en');

  // Translations are managed separately in the translations file
  // This form provides a note about translation management
  return (
    <div className="form-section">
      <h3 className="form-section-title">Translations</h3>
      
      <div className="form-help-text" style={{ marginBottom: '24px' }}>
        <p>Translations are managed in the translations file. To edit translations:</p>
        <ol style={{ marginLeft: '20px', marginTop: '12px' }}>
          <li>Edit the translations file at <code>src/utils/translations.js</code></li>
          <li>Add or modify translation keys for English, Hindi, and Telugu</li>
          <li>Changes will be reflected in the preview</li>
        </ol>
      </div>

      <div className="form-group">
        <label className="form-label">Active Language Preview</label>
        <select
          className="form-select"
          value={activeLang}
          onChange={(e) => setActiveLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="te">Telugu</option>
        </select>
      </div>

      <div className="form-help-text" style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
        <strong>Note:</strong> In a production builder, this would include a full translation editor
        with the ability to edit all translation keys directly in the UI.
      </div>
    </div>
  );
}

export default TranslationsForm;

