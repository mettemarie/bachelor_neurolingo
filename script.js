// ===== KONSTANTER OG KONFIGURATION =====
const url = "https://chatgpt.kupper.dk/";
const api_key = "Din egen API key til OpenAI";
const auth_key = "Auth key";

// ===== OVERSÆTTELSES FUNKTIONALITET =====
class TranslationManager {
    constructor() {
        this.translatableElements = this.findTranslatableElements();
    }

    findTranslatableElements() {
        const translateElements = document.querySelectorAll('.translate-me');
        return Array.from(translateElements).map(element => ({
            element: element,
            originalText: element.tagName === 'INPUT' ? element.placeholder : element.textContent.trim(),
            translatedText: "",
            isPlaceholder: element.tagName === 'INPUT'
        }));
    }

    async translateTextRequest(text, targetLanguage) {
        try {
            const formData = new FormData();
            formData.append('message', text);
            formData.append('language', targetLanguage);
            formData.append('api_key', api_key);

            const response = await fetch(`${url}api/translate/`, {
                method: 'POST',
                headers: { 'Authorization': auth_key },
                body: formData
            });

            const data = await response.json();
            return data.message || text;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }
}

// ===== LOADER FUNKTIONALITET =====
class LoaderManager {
    constructor() {
        this.loader = document.querySelector('.loader-overlay');
        this.progressBar = document.querySelector('.progress-bar');
    }

    show() {
        this.loader.style.display = 'flex';
        this.resetProgress();
    }

    hide() {
        setTimeout(() => {
            this.loader.style.display = 'none';
        }, 500);
    }

    resetProgress() {
        this.progressBar.style.width = '0%';
    }

    updateProgress(percentage) {
        this.progressBar.style.width = `${percentage}%`;
    }
}

// ===== POPUP FUNKTIONALITET =====
class PopupManager {
    constructor() {
        this.overlay = document.getElementById('popUpOverlay');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const closeBtn = document.getElementById('closeModal');
        const languageBtn = document.querySelector('.languagebtn');

        languageBtn.addEventListener('click', () => this.show());
        closeBtn.addEventListener('click', () => this.hide());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.hide();
        });
    }

    show() {
        this.overlay.style.display = 'flex';
    }

    hide() {
        this.overlay.style.display = 'none';
    }
}

// ===== HOVEDFUNKTIONALITET =====
class LanguageChanger {
    constructor() {
        this.translator = new TranslationManager();
        this.loader = new LoaderManager();
        this.popup = new PopupManager();
        this.setupFormListener();
    }

    setupFormListener() {
        const form = document.getElementById('languageForm');
        form.addEventListener('submit', (e) => this.handleLanguageChange(e));
    }

    async handleLanguageChange(event) {
        event.preventDefault();
        const input = document.getElementById('userInput');
        const newLanguage = input.value;

        this.loader.show();

        try {
            // Verificer sprog via API
            const formData = new FormData();
            formData.append('message', newLanguage);
            formData.append('api_key', api_key);

            await fetch(`${url}api/language/`, {
                method: 'POST',
                headers: { 'Authorization': auth_key },
                body: formData
            });

            // Oversæt alle elementer
            const progressIncrement = 100 / this.translator.translatableElements.length;
            let currentProgress = 0;

            for (const item of this.translator.translatableElements) {
                const translatedText = await this.translator.translateTextRequest(
                    item.originalText,
                    newLanguage
                );

                if (item.isPlaceholder) {
                    item.element.placeholder = translatedText;
                } else {
                    item.element.textContent = translatedText;
                }

                currentProgress += progressIncrement;
                this.loader.updateProgress(currentProgress);
            }

        } catch (error) {
            console.error('Language change error:', error);
        } finally {
            this.loader.hide();
            this.popup.hide();
            input.value = '';
        }
    }
}

// ===== INITIALISERING =====
document.addEventListener('DOMContentLoaded', () => {
    new LanguageChanger();
});

