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
| `src/controllers/` | Læser request, tjekker input og vælger statuskode |
| `src/services/` | Forretningslogik |
| `src/repositories/` | Læser og skriver `data/tasks.json` |
| `src/middleware/` | 404 og fejlhåndtering |
| `data/tasks.json` | Opgaverne |
| `tests/` | Automatiske tests (api, repository og service) |

Flere regler står i [AGENTS.md](AGENTS.md) og test reglerne i [docs/unit-test-guide.md](docs/unit-test-guide.md).

## Frontend (Nicki)

Siden henter opgaver fra `/api/tasks` med `fetch`. Tilføj sender POST, slet sender DELETE, og listen hentes igen bagefter. Tekst sættes ind med `textContent` og ikke `innerHTML`, så HTML i en opgave ikke kan køre som kode (XSS). DELETE svarer 204 uden body, så der kaldes ikke `response.json()`. Ved fejl tjekkes `response.ok`, og en fejlbesked vises på siden.

## Fejlhåndtering og 404 (Nicki)

`notFound` svarer 404, når ingen route matcher. `errorHandler` svarer 400 ved ugyldig JSON (`err.type === 'entity.parse.failed'`) og 500 ved alt andet. Beskeden er altid en fast dansk tekst, aldrig `err.message` eller stack trace. `errorHandler` har de fire almindelige parametre (`err, req, res, next`), som Express kræver for en fejlmiddleware, og `max-params` i ESLint er sat til 4, så det er tilladt.

## Test (Nicki)

Efter wiring var merget testede jeg manuelt:

* Tilføj og slet en opgave i browseren virker.
* Med serveren stoppet vises en fejlbesked på siden.
* GET `/api/ukendt` giver 404 med `{ "error": "Ruten blev ikke fundet." }`.
* POST `/api/tasks` med ugyldig JSON giver 400 med `{ "error": "Anmodningen indeholder ugyldig JSON." }`.

De automatiske tests (19 stk.) kører med `npm run check`.

## AI brug (Nicki)

Jeg brugte Copilot til frontenden og til 404 og fejlhåndtering. Jeg bad om en plan først, rettede den, læste diffen og kørte `npm run check`, før jeg lavede PR. Til README brugte jeg også en AI assistent til udkast og formulering. Jeg har læst det igennem og rettet det til, så jeg kan forklare det med egne ord.

## Backend (Gon)

**1. Hvilke filer er kæden, og hvad gør hver af dem?**

Kæden er controller, service og repository. De tre routes ligger i `app.js` og sender requesten videre til den rigtige controller funktion. Controlleren tjekker input og sender svaret. Servicen laver logikken, fx at give en ny opgave et id. Repositoryet læser og skriver i `tasks.json`.

**2. Hvorfor bruger vi readJson og writeJson, og hvad er forskellen på dem og fs.promises?**

`readJson` og `writeJson` kommer fra `fs-extra`. De laver selv JSON om til tekst og tilbage igen. `fs.promises` kan kun læse og skrive almindelig tekst, så der skulle vi selv bruge `JSON.parse` og `JSON.stringify`.

**3. Hvilke statuskoder svarer controlleren med, og hvornår?**

200 ved hent og 201, når en opgave er oprettet. 204, når en opgave er slettet. 400, hvis teksten er tom, og 404, hvis opgaven ikke findes. Fejl i servicen eller filen giver 500.

**4. Hvad sker der, hvis tasks.json er ødelagt?**

`readJson` kaster en fejl i repositoryet. Fejlen bobler op til controllerens `try/catch`, som fanger den og svarer 500 med en fast fejlbesked.

**5. Hvorfor ligger id og done: false i servicen og ikke i controlleren?**

Det er forretningsregler om en ny opgave. Controlleren skal kun håndtere HTTP.

**6. Hvorfor har vi et service lag?**

Servicen har rigtig logik: den laver id med `crypto.randomUUID()`, sætter `done: false` og finder og sletter en opgave. Controlleren kender kun HTTP, og repository kender kun filen, så servicen er stedet for reglerne om en opgave. Den gør også, at logikken kan testes med en fake repository.

**7. Hvad gør await?**

JavaScript kører på én event loop tråd. Når koden rammer `await`, pauser den funktion, der venter, men ikke hele serveren. Selve læsningen af filen sker uden for JavaScript tråden, så event loopet kan tage andre requests imens. Når filen er læst, fortsætter funktionen, hvor den slap.

## Test (Gon)

**1. Hvad tester repository testene, og hvorfor bruger de en midlertidig fil?**

De tjekker, at man kan skrive og læse de samme opgaver, at læsning fejler, hvis filen mangler, og at skrivning fejler, hvis stien er en mappe. Vi bruger en midlertidig mappe, så testene ikke rører den rigtige `tasks.json`, og hver test starter helt ren.

**2. Hvad tester service testene, og hvorfor bruger de en fake repository?**

De tjekker, at man kan hente opgaver, tilføje en opgave med gyldig tekst, slette en opgave der findes, og at sletning af et ukendt id giver `false`. Tom tekst afvises i controlleren, ikke i servicen. Vi bruger en fake repository, så vi ikke rører den rigtige `tasks.json`.

**3. Hvad betyder navnene, fx deleteTask_unknownId_returnsFalse?**

`deleteTask` er det, der testes. `unknownId` er inputtet, og `returnsFalse` er det forventede resultat. Navnet fortæller, hvad testen gør, og hvad den forventer.

## AI brug (Gon)

Jeg brugte Copilot til backenden. Jeg bad om en plan ud fra mit issue og implementerede den. Derefter tjekkede jeg diffen og kørte `npm run check`, før jeg lavede PR.

## Wiring (Mat)

**1. Hvad gør createApp, og hvorfor tager den repository ind udefra?**

`createApp` bygger Express appen og kobler lagene sammen (repository, service, controller) og registrerer de tre routes. Repositoryet kommer udefra (dependency injection), så man kan bytte det ud med en fake i tests eller skifte til en database uden at ændre `app.js`.

**2. Hvad gør server.js, og hvorfor bygges stien til tasks.json med path.join?**

`server.js` er indgangspunktet. Det opretter det rigtige repository, sender det til `createApp` og starter serveren på port 3000. `path.join` med `__dirname` giver en korrekt sti på alle styresystemer, uanset hvorfra man starter `node`.

**3. Hvorfor er rækkefølgen express.json, express.static, routes under /api/tasks, notFound, errorHandler?**

Middleware kører i den rækkefølge, den er registreret. `express.json` skal parse body før routes, og routes skal stå før `notFound`, ellers ville gyldige ruter få 404. `errorHandler` står sidst, fordi den kun fanger fejl fra det, der er registreret før den.

**4. Hvad er forskellen på notFound og errorHandler?**

`notFound` bruges, når ingen route matcher, og den svarer selv med 404 uden at kalde `next`. `errorHandler` har fire parametre (`err, req, res, next`) og håndterer fejl, der kastes eller sendes videre med `next(err)`.

## Test (Mat)

**1. Hvilke tests er der i api.test.js, og hvad dækker de?**

Det er integrationstests af API'et. De starter appen, sender rigtige HTTP requests med `fetch` og tjekker svaret. Hver test følger Arrange, Act, Assert. De første seks tests er listet under punkt 4, og de seks nye står efter listen.

**2. Hvorfor bruger de en fake repository, så de ikke rører data/tasks.json?**

`createApp` får sit repository som parameter: `createApp({ taskRepository })`. I produktion læser og skriver det `data/tasks.json`. I testene får den en fake, som gemmer opgaverne i en variabel i hukommelsen. Fake'en har de samme to metoder, `readTasks` og `writeTasks`, så appen opfører sig, som om den talte med det rigtige repository.

**3. Hvorfor bruger vi app.listen(0), og hvorfor lukker vi serveren i t.after?**

For at bruge `fetch` skal appen lytte på en port. En fast port som 3000 kan give konflikt, hvis den er optaget. Med `listen(0)` vælger operativsystemet en ledig port, som testen aflæser med `server.address().port`. `t.after(() => server.close())` lukker serveren, når testen er færdig, så porten ikke bliver hængende, og testprocessen kan afslutte.

**4. De tests**

* `getTasks_existingTasks_returns200AndList` kalder GET `/api/tasks` og tjekker 200 og at listen er den opgave, fake'en blev fyldt med.
* `postTasks_withText_returns201AndNewTask` sender en POST med teksten "Skriv tests" og forventer 201 og en ny opgave med id som string, den rigtige tekst og `done: false`.
* `postTasks_missingText_returns400` sender en POST med et tomt objekt og forventer 400. Det er en test af inputvalidering.
* `deleteTask_existingId_returns204` sletter en opgave, der findes, og forventer 204.
* `deleteTask_unknownId_returns404` sletter et id, der ikke findes, og forventer 404.
* `getUnknownRoute_unmatchedPath_returns404` kalder en sti, der ikke findes i appen, og forventer 404.

Efter feedback er der kommet seks tests til: `postTasks_thenGetTasks_returnsNewTask` (POST og så GET), `postTasks_emptyText_returns400`, `postTasks_onlySpaces_returns400`, `postTasks_invalidJson_returns400` (tjekker også den danske fejltekst), `postTasks_writeFails_returns500` (fake repository hvor `writeTasks` kaster) og `postTasks_textTooLong_returns400` (tekst over 200 tegn).

## AI brug (Mat)

Jeg bad Copilot om at skrive tests til API'et. Jeg rettede dem, så de fulgte Arrange, Act, Assert, og tjekkede, at de kørte grønt. Jeg fik også Copilot til at lave en plan for `api.test.js` og for `app.js` og `server.js`, da jeg lavede wiring. Jeg tjekkede diffen efter hver prompt for at sikre mig, at jeg forstod, hvad der blev lavet, og at det var korrekt.

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

Efter feedback på Node ninja rettede vi disse ting i To Do Taming, så vi ikke gentager dem:

* `errorHandler` har de fire almindelige parametre, og vi justerede ESLint i stedet for at ændre funktionens `length`.
* Agentinstruktionerne er forkortet fra ca. 12000 til ca. 2700 tegn, og reglerne, der tvang agenten til at omgå ESLint, er fjernet.
* Vi udvidede API-testene med et helt forløb (POST og så GET), ugyldig JSON, tom tekst, kun mellemrum og fejl ved skrivning.
* Servicen har rigtig logik (id, `done: false`, finde og slette), så laget kan begrundes.

Efter Mikkels spørgsmål om halvt så mange filer og regler beholdt vi service, repository og dependency injection, fordi de kan begrundes og testes. Vi fjernede `routes/`, `contracts.js` og lag reglerne i ESLint, og samlede controller og service i deres factory funktioner. Derfor er `max-lines-per-function` hævet fra 25 til 40.

Opgavetekst har nu en maksimal længde på 200 tegn. Længere tekst giver 400 med en fast dansk besked.

De ekstra API-tests, errorHandler-rettelsen, de kortere agentinstruktioner, forenklingen af strukturen, længdegrænsen og Gons to ekstra svar om service laget og await er skrevet af Nicki.