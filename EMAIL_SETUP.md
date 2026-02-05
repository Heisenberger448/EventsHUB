# Email Setup met Resend

## Stap 1: Resend Account Aanmaken

1. Ga naar [resend.com](https://resend.com)
2. Maak een gratis account aan
3. Verifieer je email adres

## Stap 2: API Key Genereren

1. Log in op je Resend dashboard
2. Ga naar "API Keys" in het menu
3. Klik op "Create API Key"
4. Geef de key een naam (bijv. "InnerCrowd Production")
5. Kopieer de API key (deze zie je maar één keer!)

## Stap 3: Environment Variable Instellen

### Lokaal Ontwikkelen
Voeg toe aan je `.env` file:
```
RESEND_API_KEY=re_jouwApiKeyHier
```

### DigitalOcean Productie
1. Ga naar je app in DigitalOcean
2. Klik op "Settings" → "App-Level Environment Variables"
3. Voeg toe:
   - Key: `RESEND_API_KEY`
   - Value: `re_jouwApiKeyHier`
4. Klik op "Save"
5. De app zal automatisch opnieuw deployen

## Stap 4: Sandbox Domain Gebruiken

**Voor testen zonder eigen domein:**

Resend biedt een gratis sandbox domain (`onboarding@resend.dev`) waarmee je kan testen. 

⚠️ **Belangrijk bij sandbox:**
- Je kunt alleen emails sturen naar het email adres waarmee je bent ingelogd bij Resend
- In het platform admin panel moet je dus je eigen Resend account email gebruiken
- Andere email adressen worden **niet** ontvangen

**Voorbeeld:**
- Resend account: `chris@jouwdomein.nl`
- Bij organisatie aanmaken: gebruik `chris@jouwdomein.nl` als contact email
- De email komt aan! ✅

- Bij organisatie aanmaken: gebruik `andere@email.nl` als contact email  
- De email komt **niet** aan ❌

## Stap 5: Eigen Domein Toevoegen (Optioneel)

Wanneer je klaar bent voor productie met je eigen domein:

1. Ga naar "Domains" in Resend dashboard
2. Klik op "Add Domain"
3. Voer je domein in (bijv. `innercrowd.nl`)
4. Voeg de DNS records toe bij je domain provider:
   - SPF record
   - DKIM records
   - DMARC record (optioneel)
5. Verifieer het domein in Resend
6. Update `lib/email.ts` regel 12:
   ```typescript
   from: 'InnerCrowd <noreply@innercrowd.nl>',
   ```

## Email Templates

De welcome email template staat in [lib/email.ts](lib/email.ts) en bevat:
- Professionele HTML styling
- Nederlandse tekst
- Welkomstbericht van de organisatie
- Wachtwoord setup knop
- 24 uur vervaldatum waarschuwing

## Testen

Na deployment:
1. Log in als platform admin op `/admin`
2. Ga naar "Organisations" → "+ Add Organisation"
3. Vul het formulier in met **je Resend account email**
4. Verstuur het formulier
5. Check je inbox voor de welcome email
6. Klik op "Wachtwoord instellen"
7. Test de login flow

## Troubleshooting

**Email komt niet aan:**
- Check of RESEND_API_KEY correct is ingesteld
- Verifieer dat je het juiste email adres gebruikt (bij sandbox)
- Check DigitalOcean logs: `doctl apps logs <app-id> --follow`
- Check Resend dashboard voor verzonden emails

**API Key Error:**
- Genereer een nieuwe API key in Resend
- Update de environment variable
- Herstart de deployment

## Kosten

- **Gratis tier**: 100 emails per dag, 3.000 per maand
- **Pro plan**: $20/maand voor 50.000 emails
- Meer info: [resend.com/pricing](https://resend.com/pricing)
