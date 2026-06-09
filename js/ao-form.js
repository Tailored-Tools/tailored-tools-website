/*
 * Tailored Tools, AO Score form submission.
 * Posts to the Cloudflare Worker endpoint specified by data-endpoint
 * on the <form> element. No third-party JS, no cookies, no analytics.
 */
(function () {
    var forms = document.querySelectorAll('form.ao-form');
    if (!forms.length) return;
    var startTime = Date.now();

    forms.forEach(function (form) {
        var status = form.querySelector('.ao-form-status');
        var submit = form.querySelector('.ao-form-submit');
        var endpoint = form.getAttribute('data-endpoint');
        var defaultLabel = submit ? submit.textContent : 'Get my AO Score →';

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            if (!endpoint || endpoint.indexOf('REPLACE_AFTER_DEPLOY') !== -1) {
                showStatus(status, 'Form not yet wired up. Email ao@tailored-tools.com.', true);
                return;
            }

            submit.disabled = true;
            submit.textContent = 'Sending…';
            showStatus(status, '', false);

            var data = {
                name:                 (form.elements.name && form.elements.name.value || '').trim(),
                business:             (form.elements.business && form.elements.business.value || '').trim(),
                url:                  (form.elements.url && form.elements.url.value || '').trim(),
                email:                (form.elements.email && form.elements.email.value || '').trim(),
                message:              (form.elements.message && form.elements.message.value || '').trim(),
                website_url_confirm:  (form.elements.website_url_confirm && form.elements.website_url_confirm.value || ''),
                elapsed_ms:           Date.now() - startTime,
            };

            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(function (res) {
                return res.json().then(function (body) {
                    return { status: res.status, body: body };
                });
            }).then(function (result) {
                if (result.body && result.body.ok) {
                    renderSuccess(form, data);
                } else {
                    var reason = result.body && result.body.error ? result.body.error : 'send_failed';
                    showStatus(status, friendlyError(reason), true);
                    submit.disabled = false;
                    submit.textContent = defaultLabel;
                }
            }).catch(function () {
                showStatus(status, 'Network error. Try again, or email ao@tailored-tools.com directly.', true);
                submit.disabled = false;
                submit.textContent = defaultLabel;
            });
        });
    });

    function showStatus(el, text, isError) {
        if (!el) return;
        el.textContent = text || '';
        el.className = 'ao-form-status' + (isError ? ' ao-form-status-error' : '');
    }

    function renderSuccess(form, data) {
        var firstName = (data.name.split(' ')[0] || 'there');
        var div = document.createElement('div');
        div.className = 'ao-form-success';
        div.setAttribute('role', 'status');
        var h3 = document.createElement('h3');
        h3.textContent = 'Thanks, ' + firstName;
        var p = document.createElement('p');
        p.textContent = "Your AO Score request is on its way. We aim to send your score within 5 working days, watch " + data.email + " for the result. If you don't see it, check spam, then email ao@tailored-tools.com.";
        div.appendChild(h3);
        div.appendChild(p);
        form.replaceWith(div);
    }

    function friendlyError(code) {
        switch (code) {
            case 'invalid_email':       return 'That email address doesn’t look right. Mind checking?';
            case 'invalid_url':
            case 'invalid_url_format':  return 'That URL doesn’t look right. Include the full https:// address.';
            case 'invalid_name':        return 'Name is required.';
            case 'invalid_business':    return 'Business name is required.';
            case 'send_failed':         return 'We couldn’t send that. Please try again or email ao@tailored-tools.com.';
            default:                    return 'Something went wrong. Try again, or email ao@tailored-tools.com directly.';
        }
    }
})();
