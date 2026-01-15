export function init() {
    const select =  document.querySelector('select');
    select.addEventListener('change', async (e) => {
        renderTemplate(e.target.value);
        updateUrlParam(e.target.value);
    });

    // Initial render
    const param = window.location.search;
    const name = param ? new URLSearchParams(param).get('template') : undefined;
    select.value = name ? name : select.querySelector('option').getAttribute('value');
    select.dispatchEvent(new Event('change'));

    const toggle = document.querySelector('a.toggle');

    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const param = new URLSearchParams(window.location.search).get('template');
        const url = new URL(toggle.href);
        url.searchParams.set('template', param);
        window.location.href = url;

    })
}

async function renderTemplate(templateName) {
    const folder = window.location.pathname.indexOf('original.html') > 0 ? 'templates-original' : 'templates';
    const file = window.location.pathname.indexOf('original.html') > 0 ? './data-original.json' : './data.json';
    const data = await fetch(file).then(res => res.json());
    const template = await fetch(`./${folder}/${templateName}/email_en.html`).then(res => res.text());
    const rendered = Mustache.render(template, data);
    console.log(rendered);
    document.querySelector('iframe').srcdoc = rendered;
}

function updateUrlParam(value) {
    const url = new URL(window.location.href);
    url.searchParams.set('template', value);
    window.history.replaceState({}, "", url);
}
