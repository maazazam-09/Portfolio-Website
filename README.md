## Maaz Portfolio Website
Modern personal portfolio built with HTML, CSS, and JavaScript.

### Contact Backend (Resend + Netlify Functions)
This portfolio now sends contact messages through your own backend endpoint instead of a public form service.

#### Files added/updated
- `netlify/functions/contact.js`
- `netlify.toml`
- `.env.example`
- `assets/js/script.js` (frontend now posts to `/.netlify/functions/contact`)

#### Setup steps
1. Create a [Resend](https://resend.com) account.
2. In Resend, verify a sender identity/domain.
3. In Netlify, open your site settings and add environment variables:
   - `RESEND_API_KEY`
   - `CONTACT_FROM_EMAIL` (must be a verified sender in Resend)
   - `CONTACT_TO_EMAIL` (`maazalamgir02@gmail.com`)
4. Deploy the site on Netlify.
5. Submit the contact form from your live site and verify email delivery.

#### Notes
- Local static previews will not send mail unless run via Netlify functions.
- API keys stay server-side in Netlify environment variables.
