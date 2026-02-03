
let template = '';
let lang = '';
let v2 = '';

export function init() {    
    const templateSelector =  document.querySelector('select#template');
    const langSelector =  document.querySelector('select#language');
    const templateLink = document.querySelector('#template_link');
    const v2Checkbox = document.querySelector('#v2');

    const params = window.location.search;
    const templateParam = params ? new URLSearchParams(params).get('template') : undefined;
    const langParam = params ? new URLSearchParams(params).get('lang') : undefined;
    const updateTemplateLink = (template, lang, v2) => {
        const folder = v2 ? 'templates_v2' : 'templates';
        const filename = v2 ? `email_${lang}.html` : 'email.html';
        templateLink.setAttribute('href', `${folder}/${template}/${filename}`);
    };
    const v2Param = params ? new URLSearchParams(params).get('v2') : undefined;


    if (templateParam) {
        templateSelector.value = templateParam 
    }

    if (langParam) {
        langSelector.value = langParam;
    }

    console.log(v2Param)

    v2Checkbox.checked = v2Param === 'true' ? true : false;

    template = templateSelector.value;
    lang = langSelector.value;
    v2 = v2Checkbox.checked;

    console.log(`Initial template: ${template}, lang: ${lang}, v2: ${v2}`);

    updateTemplateLink(template, lang, v2);

    renderTemplate(template, lang, v2);

    templateSelector.addEventListener('change', async (e) => {
        template = e.target.value;
        updateTemplateLink(template, lang, v2);
        renderTemplate(template, lang, v2);
        updateUrlParam();
    });

    langSelector.addEventListener('change', async (e) => {
        lang = e.target.value;
        updateTemplateLink(template, lang, v2);
        renderTemplate(template, lang, v2);
        updateUrlParam();
    });

    v2Checkbox.addEventListener('change', async (e) => {
        v2 = e.target.checked;
        updateTemplateLink(template, lang, v2);
        renderTemplate(template, lang, v2);
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
                body: JSON.stringify({ email, template, lang, mailtrap, v2}),
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

async function renderTemplate(templateName, lang, v2) {
    const folder = v2 ? 'templates_v2' : 'templates';
    const file = v2 ? './data_v2.json' : `./data_${lang}.json`;
    const filename = v2 ? `email_${lang}.html` : 'email.html';
    const data = await fetch(file).then(res => res.json());
    const template = await fetch(`./${folder}/${templateName}/${filename}`).then(res => res.text());
    const rendered = Mustache.render(template, data);
    document.querySelector('iframe').srcdoc = rendered;
}

function updateUrlParam() {
    console.log('Updating URL params', lang);
    const url = new URL(window.location.href);
    url.searchParams.set('template', template);
    url.searchParams.set('lang', lang);
    url.searchParams.set('v2', v2);
    window.history.replaceState({}, "", url);
}
