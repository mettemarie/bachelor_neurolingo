// Domain for API
const url = "https://chatgpt.kupper.dk/";

// OpenAI API key and Authentication
const api_key = "Din egen API key til OpenAI";
const auth_key = "12tre_hokuspokus";

// Assign language
let language = "Danish";

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

        // Translate and update elements one by one
        for (const item of translatableElements) {
            const translatedText = await translateTextRequest(item.originalText, newLanguage);
            item.translatedText = translatedText;
            if (item.isPlaceholder) {
                item.element.placeholder = translatedText;
            } else {
                item.element.textContent = translatedText;
            }
        }

    } catch (error) {
        console.error('Language change error:', error);
        document.querySelector('.text-object').textContent = 'Error: ' + error.message;
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
        console.log('Translation response:', data);
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

