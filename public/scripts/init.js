
let template = '';
let lang = '';

export function init() {    
    const templateSelector =  document.querySelector('select#template');
    const langSelector =  document.querySelector('select#language');
    const templateLink = document.querySelector('#template_link');

    const params = window.location.search;
    const templateParam = params ? new URLSearchParams(params).get('template') : undefined;
    const langParam = params ? new URLSearchParams(params).get('lang') : undefined;
    const updateTemplateLink = (template, lang) => {
        templateLink.setAttribute('href', `templates/${template}/email_${lang}.html`);
    };

    if (templateParam) {
        templateSelector.value = templateParam 
    }

    if (langParam) {
        langSelector.value = langParam;
    }

    template = templateSelector.value;
    lang = langSelector.value;

    console.log(`Initial template: ${template}, lang: ${lang}`);

    renderTemplate(template, lang);
    updateTemplateLink(template, lang);



    templateSelector.addEventListener('change', async (e) => {
        template = e.target.value;
        renderTemplate(template, lang);
        updateTemplateLink(template, lang);
        updateUrlParam();
    });

    langSelector.addEventListener('change', async (e) => {
        lang = e.target.value;
        renderTemplate(template, lang);
        updateTemplateLink(template, lang);
        updateUrlParam();
    });

    const form = document.getElementById('form');
    if (form) {
        document.getElementById('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const mailtrap = e.target.mailtrap.checked;
            console.log('mailtrap', mailtrap);

            fetch('api/emailer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, template, lang, mailtrap}),
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

    const toggle = document.querySelector('a.toggle');
    // switch between original and modified templates while preserving template selection
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const param = new URLSearchParams(window.location.search).get('template');
        const url = new URL(toggle.href);
        url.searchParams.set('template', param);
        window.location.href = url;
    })
}

async function renderTemplate(templateName, lang) {
    const folder = window.location.pathname.indexOf('original.html') > 0 ? 'templates-original' : 'templates';
    const file = window.location.pathname.indexOf('original.html') > 0 ? './data-original.json' : `./data_${lang}.json`;
    const data = await fetch(file).then(res => res.json());
    const template = await fetch(`./${folder}/${templateName}/email_${lang}.html`).then(res => res.text());
    const rendered = Mustache.render(template, data);
    document.querySelector('iframe').srcdoc = rendered;
}

function updateUrlParam() {
    console.log('Updating URL params', lang);
    const url = new URL(window.location.href);
    url.searchParams.set('template', template);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, "", url);
}
