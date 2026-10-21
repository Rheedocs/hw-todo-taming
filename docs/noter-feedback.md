# Noter: rettelser efter Mikkels feedback

Mine egne noter til at kunne forklare ændringerne.

## Oversigt

| Punkt | Hvad | Hvor | Hvorfor |
|---|---|---|---|
| 1. Samtidighed | Kø af promises, én operation ad gangen | `taskService.js` (`enqueue`) | To requests læste samme liste, og den sidste skrivning overskrev den første |
| 2. Test | 10 samtidige POSTs med langsom fake repository | `api.test.js` og `taskService.test.js` | Før køen blev 2 af 10 gemt, efter køen 10 af 10 |
| 3. `done` | `PATCH /api/tasks/:id` plus afkrydsningsfelt | `app.js`, controller, service, `main.js` | `done` kunne aldrig ændres. 400 ved ikke boolean, 404 ved ukendt id |
| 4. Logging | `catch (error)` og `console.error` | `sendServerError` i controlleren | Udvikleren ser den rigtige fejl, brugeren ser en fast dansk besked |
| 5. Trim | Teksten trimmes på serveren før validering og gem | `readText` i controlleren | Mellemrum blev gemt, og længden blev tjekket på forkert tekst |
| 6. Arkitektur | Lagene forklaret i README | README | Controller kender HTTP, service kender reglerne, repository kender filen |

## Fundet og rettet bagefter

Hvis PATCH fejlede, forsvandt fejlbeskeden med det samme, og fluebenet blev stående. Nu sættes fluebenet tilbage med `checkbox.checked = !checkbox.checked`, og fejlen bliver stående. Fundet ved Copilot review og tjekket ved at stoppe serveren og klikke på et flueben.

## Sådan forklarer jeg det

* **Kæden:** `fetch()` i `main.js`, route i `app.js`, controller (tjekker input), service (regler og kø), repository (filen), og så svaret tilbage med statuskode.
* **Hvorfor en kø:** Alle operationer læser hele filen og skriver den tilbage. Køen gør, at næste operation først starter, når den forrige er færdig.
* **Begrænsning:** Køen virker kun i én serverproces. Med en database er den unødvendig, fordi databasen selv håndterer samtidige ændringer.
* **Skifte fil til database:** Lav et nyt repository med de samme metoder og giv det til `createApp` i `server.js`. Controller og routes ændres ikke.
* **Lint:** `max-lines-per-function` er hævet fra 40 til 60, fordi controller og service har fire operationer hver. `complexity` er stadig 6.

## Spørgsmål jeg skal kunne svare på

1. Hvad sker der, hvis to requests kommer samtidig, og der ikke er en kø?
2. Hvorfor 400 for ugyldig `done`, men 404 for ukendt id?
3. Hvorfor logger vi fejlen, men sender ikke `error.message` til brugeren?
4. Hvorfor ligger `done: false` i servicen og ikke i controlleren?