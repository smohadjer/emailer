
let template = '';
let lang = '';
let v2 = '';
let branded = '';

export function init() {    
    const templateSelector =  document.querySelector('select#template');
    const langSelector =  document.querySelector('select#language');
    const templateLink = document.querySelector('#template_link');
    const emailLink = document.querySelector('#email_link');
    const v2Checkbox = document.querySelector('#v2');
    const brandedCheckbox = document.querySelector('#branded');

    const params = window.location.search;
    const templateParam = params ? new URLSearchParams(params).get('template') : undefined;
    const langParam = params ? new URLSearchParams(params).get('lang') : undefined;
    const updateTemplateLink = (template, lang, v2, branded) => {
        const folder = v2 ? 'templates_v2' : 'templates';
        const filename = v2 ? `email_${lang}.html` : 'email.html';
        templateLink.setAttribute('href', `${folder}/${template}/${filename}`);

        const href = `api/emailer?template=${template}&lang=${lang}${v2 ? `&v2=${v2}` : ''}${branded ? `&branded=${branded}` : ''}`;
        emailLink.setAttribute('href', href);
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
    brandedCheckbox.checked = v2Param === 'true' ? true : false;

    template = templateSelector.value;
    lang = langSelector.value;
    v2 = v2Checkbox.checked;
    branded = brandedCheckbox.checked;

    console.log(`Initial template: ${template}, lang: ${lang}, v2: ${v2}`, `branded: ${branded}`);

    updateTemplateLink(template, lang, v2, branded);

    renderTemplate(template, lang, v2, branded);

    templateSelector.addEventListener('change', async (e) => {
        template = e.target.value;
        updateTemplateLink(template, lang, v2, branded);
        renderTemplate(template, lang, v2, branded);
        updateUrlParam();
    });

    langSelector.addEventListener('change', async (e) => {
        lang = e.target.value;
        updateTemplateLink(template, lang, v2, branded);
        renderTemplate(template, lang, v2, );
        updateUrlParam();
    });

    v2Checkbox.addEventListener('change', async (e) => {
        v2 = e.target.checked;
        updateTemplateLink(template, lang, v2, branded);
        renderTemplate(template, lang, v2, branded);
        updateUrlParam();
    });

    brandedCheckbox.addEventListener('change', async (e) => {
        branded = e.target.checked;
        updateTemplateLink(template, lang, v2, branded);
        renderTemplate(template, lang, v2, branded);
        updateUrlParam();
    });

    const form = document.getElementById('form');
    if (form) {
        document.getElementById('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const mailtrap = e.target.mailtrap.checked;
            const branded = e.target.branded.checked;
            console.log('branded', branded);

            fetch('api/emailer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, template, lang, mailtrap, branded, v2}),
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
    const file = v2 ? 'data_v2.json' : `./${folder}/${templateName}/data_${lang}.json`;
    const filename = v2 ? `email_${lang}.html` : 'email.html';
    const data = await fetch(file).then(res => res.json());
    // if branded is false, we can remove the branding section from the data to prevent it from rendering in the email. This allows us to use the same template with or without branding based on the user's choice.
    if (!branded) {
        if (data.branding) {
            console.log('Removing branding from email data');
            delete data.branding;
        }
    }
    const template = await fetch(`./${folder}/${templateName}/${filename}`).then(res => res.text());
    const rendered = Mustache.render(template, data);
    document.querySelector('iframe').srcdoc = rendered;
}

function updateUrlParam() {
    console.log('Updating URL params', lang);
    const url = new URL(window.location.href);
    url.searchParams.set('template', template);
    url.searchParams.set('lang', lang);

    if (v2) {
        url.searchParams.set('v2', v2);
    } else {
        url.searchParams.delete('v2');
    }

    if (branded) {
        url.searchParams.set('branded', branded);
    } else {
        url.searchParams.delete('branded');
    }

    window.history.replaceState({}, "", url);
}
