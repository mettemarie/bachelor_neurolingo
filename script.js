// Domain for API
const url = "https://chatgpt.kupper.dk/";

// OpenAI API key and Authentication
const api_key = "Din egen API key til OpenAI";
const auth_key = "12tre_hokuspokus";


const translatableElements = findTranslatableElements();


function findTranslatableElements() {
    const translateElements = document.querySelectorAll('.translate-me');
    const elementsList = Array.from(translateElements).map(element => {
        return {
            element: element,
            originalText: element.tagName === 'INPUT' ? element.placeholder : element.textContent.trim(),
            translatedText: "",
            isPlaceholder: element.tagName === 'INPUT'
        };
    });
    return elementsList;
}


async function changeLanguage(event) {
    event.preventDefault();
    const input = document.getElementById('userInput');
    const newLanguage = input.value;

    // Vis loader
    document.querySelector('.loader-overlay').style.display = 'flex';

    // Reset progress bar
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = '0%';

    try {
        const formData = new FormData();
        formData.append('message', newLanguage);
        formData.append('api_key', api_key);

        const response = await fetch(`${url}api/language/`, {
            method: 'POST',
            headers: {
                'Authorization': auth_key
            },
            body: formData
        });

        const data = await response.json();
        language = newLanguage;

        // Beregn hvor meget hver oversættelse udgør af den totale progress
        const progressIncrement = 100 / translatableElements.length;
        let currentProgress = 0;

        // Translate and update elements one by one
        for (const item of translatableElements) {
            const translatedText = await translateTextRequest(item.originalText, newLanguage);
            item.translatedText = translatedText;
            if (item.isPlaceholder) {
                item.element.placeholder = translatedText;
            } else {
                item.element.textContent = translatedText;
            }

            // Opdater progress
            currentProgress += progressIncrement;
            progressBar.style.width = `${currentProgress}%`;
        }

    } catch (error) {
        console.error('Language change error:', error);
        document.querySelector('.text-object').textContent = 'Error: ' + error.message;
    } finally {
        // Skjul loader når vi er færdige (uanset om der var en fejl eller ej)
        setTimeout(() => {
            document.querySelector('.loader-overlay').style.display = 'none';
        }, 500); // Lille forsinkelse så man kan se 100%
    }

    // Reset
    input.value = '';
}


async function translateTextRequest(text, targetLanguage) {
    try {
        const formData = new FormData();
        formData.append('message', text);
        formData.append('language', targetLanguage);
        formData.append('api_key', api_key);

        const response = await fetch(`${url}api/translate/`, {
            method: 'POST',
            headers: {
                'Authorization': auth_key
            },
            body: formData
        });

        const data = await response.json();
        return data.message || text;
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
}

// Pop-up functionality
document.addEventListener('DOMContentLoaded', function () {
    const popUpOverlay = document.getElementById('popUpOverlay');
    const closePopUp = document.getElementById('closeModal');
    const languageBtn = document.querySelector('.languagebtn');
    const languageForm = document.getElementById('languageForm');

    // Vis popUp når der klikkes på language knappen
    languageBtn.addEventListener('click', function () {
        popUpOverlay.style.display = 'flex';
    });

    // Luk popUp når der klikkes på luk-knappen
    closePopUp.addEventListener('click', function () {
        popUpOverlay.style.display = 'none';
    });

    // Luk popUp når der klikkes udenfor popUppen
    popUpOverlay.addEventListener('click', function (e) {
        if (e.target === popUpOverlay) {
            popUpOverlay.style.display = 'none';
        }
    });

    // Håndter form submission
    languageForm.addEventListener('submit', function (e) {
        changeLanguage(e);
        popUpOverlay.style.display = 'none';
    });
});

