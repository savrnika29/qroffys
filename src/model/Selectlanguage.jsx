
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Selectlanguage = () => {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

  // Language options with their codes and display names
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'zh', name: 'Chinese', nativeName: '中國人' }
  ];

  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
  };

  const handleContinue = () => {
    // Change the language using i18n
    i18n.changeLanguage(selectedLanguage);

    // Store the selected language in localStorage for persistence
    localStorage.setItem('selectedLanguage', selectedLanguage);

    // Close the modal (if using Bootstrap)
    const modal = document.getElementById('languagepopup');
    if (modal) {
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
    window.location.reload();

  };

  return (
    <div>
      <div
        className="custom-modal modal fade"
        id="languagepopup"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <div className="container">
                <div className="language-wrapper">
                  <div className="form-group form-group-radio">
                    <label htmlFor="language" className="form-label w-100">
                      Select Language
                    </label>
                    {languages.map((language) => (
                      <div className="form-check" key={language.code}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="languageSelect"
                          id={`language_${language.code}`}
                          checked={selectedLanguage === language.code}
                          onChange={() => handleLanguageChange(language.code)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`language_${language.code}`}
                        >
                          {language.nativeName}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="btn-block">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleContinue}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Selectlanguage;