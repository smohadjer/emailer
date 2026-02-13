
let template = '';
let lang = '';
let original = '';
let branded = '';

export function init() {    
    const templateSelector =  document.querySelector('select#template');
    const langSelector =  document.querySelector('select#language');
    const templateLink = document.querySelector('#template_link');
    const emailLink = document.querySelector('#email_link');
    const originalCheckbox = document.querySelector('#original');
    const brandedCheckbox = document.querySelector('#branded');
    const form = document.getElementById('form');

    const params = window.location.search;
    const templateParam = params ? new URLSearchParams(params).get('template') : undefined;
    const langParam = params ? new URLSearchParams(params).get('lang') : undefined;
    const brandedParam = params ? new URLSearchParams(params).get('branded') : undefined;
    const originalParam = params ? new URLSearchParams(params).get('original') : undefined;

    const updateTemplateLink = (template, lang, original, branded) => {
        const folder = original ? 'templates_original' : 'templates';
        const filename = original ? `email_${lang}.html` : 'email.html';
        templateLink.setAttribute('href', `${folder}/${template}/${filename}`);

        const href = `api/emailer?template=${template}&lang=${lang}${original ? `&original=${original}` : ''}${branded ? `&branded=${branded}` : ''}`;
        emailLink.setAttribute('href', href);
    };

    if (templateParam) {
        templateSelector.value = templateParam 
    }

    if (langParam) {
        langSelector.value = langParam;
    }

    if (brandedParam) {
        brandedCheckbox.checked = brandedParam === 'true' ? true : false;
    }

    originalCheckbox.checked = originalParam === 'true' ? true : false;

    template = templateSelector.value;
    lang = langSelector.value;
    original = originalCheckbox.checked;
    branded = brandedCheckbox.checked;

    updateTemplateLink(template, lang, original, branded);
    renderTemplate(template, lang, original, branded);

    templateSelector.addEventListener('change', async (e) => {
        template = e.target.value;
        updateTemplateLink(template, lang, original, branded);
        renderTemplate(template, lang, original, branded);
        updateUrlParam();
    });

    langSelector.addEventListener('change', async (e) => {
        const newLang = e.target.value;
        const rendered = await renderTemplate(template, newLang, original, );
        if (rendered) {
            lang = newLang;
            updateTemplateLink(template, lang, original, branded);
            updateUrlParam();
        } else {
            // if rendering failed (most likely due to missing data file for the selected language), we can revert the language selection back to the previous value to prevent broken template rendering and links.
            console.log(lang);
            langSelector.value = lang;

        }
    });

    originalCheckbox.addEventListener('change', async (e) => {
        original = e.target.checked;
        updateTemplateLink(template, lang, original, branded);
        renderTemplate(template, lang, original, branded);
        updateUrlParam();
    });

    brandedCheckbox.addEventListener('change', async (e) => {
        branded = e.target.checked;
        updateTemplateLink(template, lang, original, branded);
        renderTemplate(template, lang, original, branded);
        updateUrlParam();
    });

    if (form) {
        document.getElementById('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const mailtrap = e.target.mailtrap.checked;

            fetch('api/emailer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, template, lang, mailtrap, branded, original}),
            })
            .then(response => response.json())
            .then(data => {
                alert('Email sent successfully!');
            })
            .catch((error) => {
                alert('Error sending email.');
                console.error('Error:', error);
            });
        });
    }
}

async function renderTemplate(templateName, lang, original) {
    const folder = original ? 'templates_original' : 'templates';
    const file = original ? 'data_original.json' : `./${folder}/${templateName}/data_${lang}.json`;
    const filename = original ? `email_${lang}.html` : 'email.html';
    const data = await fetch(file).then(res => res.json()).catch(error => {
        alert('Specified language data file not found.');
        return null;
    });

    // if branded is false, we can remove the branding section from the data to prevent it from rendering in the email. This allows us to use the same template with or without branding based on the user's choice.
    if (!branded) {
        if (data && data.branding) {
            console.log('Removing branding from email data');
            delete data.branding;
        }
    }

    if (data) {
        const template = await fetch(`./${folder}/${templateName}/${filename}`).then(res => res.text());
        const rendered = Mustache.render(template, data);
        document.querySelector('iframe').srcdoc = rendered;
        return true;
    }
}

function updateUrlParam() {
    console.log('Updating URL params', lang);
    const url = new URL(window.location.href);
    url.searchParams.set('template', template);
    url.searchParams.set('lang', lang);

    if (original) {
        url.searchParams.set('original', original);
    } else {
        url.searchParams.delete('original');
    }

    if (branded) {
        url.searchParams.set('branded', branded);
    } else {
        url.searchParams.delete('branded');
    }

    window.history.replaceState({}, "", url);
}
