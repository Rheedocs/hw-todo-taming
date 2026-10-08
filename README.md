# To Do Taming

## Hvad laver programmet?

En fullstack app til opgaver (en "Taskmaster"). Backenden er en Express server, der gemmer opgaverne i en JSON fil uden database. Frontenden er en HTML side, der bruger `fetch` til at vise, tilføje og slette opgaver.

## Kom i gang

```bash
npm install
npm start
```

Åbn derefter `http://localhost:3000` i browseren. Serveren skriver ikke noget i terminalen, når den kører. Stop den med Ctrl+C.

## API

| Metode | Endpoint | Funktion |
|---|---|---|
| GET | `/api/tasks` | Henter alle opgaver |
| POST | `/api/tasks` | Tilføjer en opgave (`{ "text": "..." }`) |
| DELETE | `/api/tasks/:id` | Sletter opgaven med id'et |

## Struktur

| Mappe eller fil | Ansvar |
|---|---|
| `public/` | Frontend (HTML, JavaScript og CSS) |
| `src/app.js` | Samler middleware og routes (`createApp`) |
| `src/server.js` | Opretter repository og starter serveren på port 3000 |
| `src/routes/` | Kobler URL og metode til controlleren |
| `src/controllers/` | Læser request, tjekker input og vælger statuskode |
| `src/services/` | Forretningslogik |
| `src/repositories/` | Læser og skriver `data/tasks.json` |
| `src/middleware/` | 404 og fejlhåndtering |
| `src/contracts.js` | Aftalte typer mellem lagene |
| `data/tasks.json` | Opgaverne |
| `tests/` | Automatiske tests (api, repository og service) |

Flere regler står i [AGENTS.md](AGENTS.md) og test reglerne i [docs/unit-test-guide.md](docs/unit-test-guide.md).

## Frontend (Nicki)

Siden henter opgaver fra `/api/tasks` med `fetch`. Tilføj sender POST, slet sender DELETE, og listen hentes igen bagefter. Tekst sættes ind med `textContent` og ikke `innerHTML`, så HTML i en opgave ikke kan køre som kode (XSS). DELETE svarer 204 uden body, så der kaldes ikke `response.json()`. Ved fejl tjekkes `response.ok`, og en fejlbesked vises på siden.

## Fejlhåndtering og 404 (Nicki)

`notFound` svarer 404, når ingen route matcher. `errorHandler` svarer 400 ved ugyldig JSON (`err.type === 'entity.parse.failed'`) og 500 ved alt andet. Beskeden er altid en fast dansk tekst, aldrig `err.message` eller stack trace. Express kræver fire parametre for en fejlmiddleware, men ESLint vil ikke have ubrugt `next`, så længden sættes til 4 med `Object.defineProperty`.

## Test (Nicki)

Efter wiring var merget testede jeg manuelt:

* Tilføj og slet en opgave i browseren virker.
* Med serveren stoppet vises en fejlbesked på siden.
* GET `/api/ukendt` giver 404 med `{ "error": "Ruten blev ikke fundet." }`.
* POST `/api/tasks` med ugyldig JSON giver 400 med `{ "error": "Anmodningen indeholder ugyldig JSON." }`.

De automatiske tests (13 stk.) kører med `npm run check`.

## AI brug (Nicki)

Jeg brugte Copilot til frontenden og til 404 og fejlhåndtering. Jeg bad om en plan først, rettede den, læste diffen og kørte `npm run check`, før jeg lavede PR. Til README brugte jeg også en AI assistent til udkast og formulering. Jeg har læst det igennem og rettet det til, så jeg kan forklare det med egne ord.

## Backend (Gon)

<!-- Skriv med egne ord, 5 til 8 sætninger. Svar på:
1. Hvilke filer er kæden, og hvad gør hver af dem (route, controller, service, repository)?
2. Hvorfor bruger vi readJson og writeJson, og hvad er forskellen på dem og fs.promises?
3. Hvilke statuskoder svarer controlleren med, og hvornår (201, 204, 400, 404, 500)?
4. Hvad sker der, hvis tasks.json er ødelagt? Hvem fanger fejlen, og hvad får klienten?
5. Hvorfor ligger id og done: false i servicen og ikke i controlleren? -->

Skriv her.

## Test (Gon)

<!-- Skriv med egne ord. Svar på:
1. Hvad tester repository testene, og hvorfor bruger de en midlertidig fil?
2. Hvad tester service testene, og hvorfor bruger de en fake repository?
3. Hvad betyder navnene, fx deleteTask_unknownId_returnsFalse? -->

Skriv her.

## AI brug (Gon)

<!-- Hvad bad du Copilot om, hvad ændrede den, og hvad tjekkede du selv i diffen? Skriv kun det, du selv har gjort. -->

Skriv her.

## Wiring (Mat)

<!-- Skriv med egne ord. Svar på:
1. Hvad gør createApp, og hvorfor tager den repository ind udefra?
2. Hvad gør server.js, og hvorfor bygges stien til tasks.json med path.join?
3. Hvorfor er rækkefølgen express.json, express.static, routes under /api/tasks, notFound, errorHandler?
4. Hvad er forskellen på notFound og errorHandler? Husk at notFound svarer selv med 404 og ikke sender videre med next. -->

Skriv her.

## Test (Mat)

<!-- Skriv med egne ord. Svar på:
1. Hvilke seks tests er der i api.test.js, og hvad dækker de?
2. Hvorfor bruger de en fake repository, så de ikke rører data/tasks.json?
3. Hvorfor bruger vi app.listen(0), og hvorfor lukker vi serveren i t.after?
4. Skriv kun om tests, du har set køre grønt. -->

Skriv her.

## AI brug (Mat)

<!-- Hvad bad du Copilot om, hvad ændrede den, og hvad tjekkede du selv i diffen? Skriv kun det, du selv har gjort. -->

Skriv her.

## Refleksionsspørgsmål

### 1. Hvordan kunne man forhindre, at data bliver væk ved crash?

Vi skriver hele `tasks.json` på én gang. Crasher serveren midt i, kan filen blive halv og ødelagt. Man kunne skrive til en midlertidig fil først og omdøbe den, når den er helt færdig, så filen altid er hel. En backup af og til hjælper også.

### 2. Hvad ville du gøre anderledes med en database?

Nu læser og skriver vi hele filen, også når vi kun tilføjer én opgave. En database kan ændre én opgave ad gangen og klarer selv at gemme sikkert. Det er kun repository, der skulle skiftes ud, fordi de andre lag ikke ved, hvor data ligger.

### 3. Hvad sker der, hvis to brugere tilføjer på samme tid?

Begge kan læse den samme liste, før nogen har gemt. Så tilføjer hver sin opgave til sin egen kopi, og den der gemmer sidst overskriver den anden. Den ene opgave forsvinder uden en fejl. En kø, der gemmer én ad gangen, eller en database kunne løse det.

### 4. Hvordan kunne man udvide med status, redigering eller deadlines?

`done` findes allerede på opgaven. Man kunne lave en PATCH route på `/api/tasks/:id`, der ændrer `done` eller `text`, og en knap eller et afkrydsningsfelt i frontenden. En deadline kunne være et nyt felt som `dueDate`, som tjekkes i servicen. Ukendt id skal give 404, ligesom ved DELETE.

## Bonus

Ingen endnu.