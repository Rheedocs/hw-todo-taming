# To Do Taming

## Hvad laver programmet?

En fullstack app til opgaver (en "Taskmaster"). Backenden er en Express server, der gemmer opgaverne i en JSON fil uden database. Frontenden er en HTML side, der bruger `fetch` til at vise, tilfÃ¸je og slette opgaver.

## Kom i gang

```bash
npm install
npm start
```

Ã…bn derefter `http://localhost:3000` i browseren. Serveren skriver ikke noget i terminalen, nÃ¥r den kÃ¸rer. Stop den med Ctrl+C.

## API

| Metode | Endpoint | Funktion |
|---|---|---|
| GET | `/api/tasks` | Henter alle opgaver |
| POST | `/api/tasks` | TilfÃ¸jer en opgave (`{ "text": "..." }`) |
| DELETE | `/api/tasks/:id` | Sletter opgaven med id'et |

## Struktur

| Mappe eller fil | Ansvar |
|---|---|
| `public/` | Frontend (HTML, JavaScript og CSS) |
| `src/app.js` | Samler middleware og routes (`createApp`) |
| `src/server.js` | Opretter repository og starter serveren pÃ¥ port 3000 |
| `src/routes/` | Kobler URL og metode til controlleren |
| `src/controllers/` | LÃ¦ser request, tjekker input og vÃ¦lger statuskode |
| `src/services/` | Forretningslogik |
| `src/repositories/` | LÃ¦ser og skriver `data/tasks.json` |
| `src/middleware/` | 404 og fejlhÃ¥ndtering |
| `src/contracts.js` | Aftalte typer mellem lagene |
| `data/tasks.json` | Opgaverne |
| `tests/` | Automatiske tests (api, repository og service) |

Flere regler stÃ¥r i [AGENTS.md](AGENTS.md) og test reglerne i [docs/unit-test-guide.md](docs/unit-test-guide.md).

## Frontend (Nicki)

Siden henter opgaver fra `/api/tasks` med `fetch`. TilfÃ¸j sender POST, slet sender DELETE, og listen hentes igen bagefter. Tekst sÃ¦ttes ind med `textContent` og ikke `innerHTML`, sÃ¥ HTML i en opgave ikke kan kÃ¸re som kode (XSS). DELETE svarer 204 uden body, sÃ¥ der kaldes ikke `response.json()`. Ved fejl tjekkes `response.ok`, og en fejlbesked vises pÃ¥ siden.

## FejlhÃ¥ndtering og 404 (Nicki)

`notFound` svarer 404, nÃ¥r ingen route matcher. `errorHandler` svarer 400 ved ugyldig JSON (`err.type === 'entity.parse.failed'`) og 500 ved alt andet. Beskeden er altid en fast dansk tekst, aldrig `err.message` eller stack trace. `errorHandler` har de fire almindelige parametre (`err, req, res, next`), som Express krÃ¦ver for en fejlmiddleware, og `max-params` i ESLint er sat til 4, sÃ¥ det er tilladt.

## Test (Nicki)

Efter wiring var merget testede jeg manuelt:

* TilfÃ¸j og slet en opgave i browseren virker.
* Med serveren stoppet vises en fejlbesked pÃ¥ siden.
* GET `/api/ukendt` giver 404 med `{ "error": "Ruten blev ikke fundet." }`.
* POST `/api/tasks` med ugyldig JSON giver 400 med `{ "error": "Anmodningen indeholder ugyldig JSON." }`.

De automatiske tests (18 stk.) kÃ¸rer med `npm run check`.

## AI brug (Nicki)

Jeg brugte Copilot til frontenden og til 404 og fejlhÃ¥ndtering. Jeg bad om en plan fÃ¸rst, rettede den, lÃ¦ste diffen og kÃ¸rte `npm run check`, fÃ¸r jeg lavede PR. Til README brugte jeg ogsÃ¥ en AI assistent til udkast og formulering. Jeg har lÃ¦st det igennem og rettet det til, sÃ¥ jeg kan forklare det med egne ord.

## Backend (Gon)

**1. Hvilke filer er kÃ¦den, og hvad gÃ¸r hver af dem?**

KÃ¦den er route, controller, service og repository. Routen sender requesten videre til den rigtige controller funktion. Controlleren tjekker input og sender svaret. Servicen laver logikken, fx at give en ny opgave et id. Repositoryet lÃ¦ser og skriver i `tasks.json`.

**2. Hvorfor bruger vi readJson og writeJson, og hvad er forskellen pÃ¥ dem og fs.promises?**

`readJson` og `writeJson` kommer fra `fs-extra`. De laver selv JSON om til tekst og tilbage igen. `fs.promises` kan kun lÃ¦se og skrive almindelig tekst, sÃ¥ der skulle vi selv bruge `JSON.parse` og `JSON.stringify`.

**3. Hvilke statuskoder svarer controlleren med, og hvornÃ¥r?**

200 ved hent og 201, nÃ¥r en opgave er oprettet. 204, nÃ¥r en opgave er slettet. 400, hvis teksten er tom, og 404, hvis opgaven ikke findes. Fejl i servicen eller filen giver 500.

**4. Hvad sker der, hvis tasks.json er Ã¸delagt?**

`readJson` kaster en fejl i repositoryet. Fejlen bobler op til controllerens `try/catch`, som fanger den og svarer 500 med en fast fejlbesked.

**5. Hvorfor ligger id og done: false i servicen og ikke i controlleren?**

Det er forretningsregler om en ny opgave. Controlleren skal kun hÃ¥ndtere HTTP.

## Test (Gon)

**1. Hvad tester repository testene, og hvorfor bruger de en midlertidig fil?**

De tjekker, at man kan skrive og lÃ¦se de samme opgaver, at lÃ¦sning fejler, hvis filen mangler, og at skrivning fejler, hvis stien er en mappe. Vi bruger en midlertidig mappe, sÃ¥ testene ikke rÃ¸rer den rigtige `tasks.json`, og hver test starter helt ren.

**2. Hvad tester service testene, og hvorfor bruger de en fake repository?**

De tjekker, at man kan hente opgaver, tilfÃ¸je en opgave med gyldig tekst, slette en opgave der findes, og at sletning af et ukendt id giver `false`. Tom tekst afvises i controlleren, ikke i servicen. Vi bruger en fake repository, sÃ¥ vi ikke rÃ¸rer den rigtige `tasks.json`.

**3. Hvad betyder navnene, fx deleteTask_unknownId_returnsFalse?**

`deleteTask` er det, der testes. `unknownId` er inputtet, og `returnsFalse` er det forventede resultat. Navnet fortÃ¦ller, hvad testen gÃ¸r, og hvad den forventer.

## AI brug (Gon)

Jeg brugte Copilot til backenden. Jeg bad om en plan ud fra mit issue og implementerede den. Derefter tjekkede jeg diffen og kÃ¸rte `npm run check`, fÃ¸r jeg lavede PR.

## Wiring (Mat)

**1. Hvad gÃ¸r createApp, og hvorfor tager den repository ind udefra?**

`createApp` bygger Express appen og kobler lagene sammen (repository, service, controller, routes). Repositoryet kommer udefra (dependency injection), sÃ¥ man kan bytte det ud med en fake i tests eller skifte til en database uden at Ã¦ndre `app.js`.

**2. Hvad gÃ¸r server.js, og hvorfor bygges stien til tasks.json med path.join?**

`server.js` er indgangspunktet. Det opretter det rigtige repository, sender det til `createApp` og starter serveren pÃ¥ port 3000. `path.join` med `__dirname` giver en korrekt sti pÃ¥ alle styresystemer, uanset hvorfra man starter `node`.

**3. Hvorfor er rÃ¦kkefÃ¸lgen express.json, express.static, routes under /api/tasks, notFound, errorHandler?**

Middleware kÃ¸rer i den rÃ¦kkefÃ¸lge, den er registreret. `express.json` skal parse body fÃ¸r routes, og routes skal stÃ¥ fÃ¸r `notFound`, ellers ville gyldige ruter fÃ¥ 404. `errorHandler` stÃ¥r sidst, fordi den kun fanger fejl fra det, der er registreret fÃ¸r den.

**4. Hvad er forskellen pÃ¥ notFound og errorHandler?**

`notFound` bruges, nÃ¥r ingen route matcher, og den svarer selv med 404 uden at kalde `next`. `errorHandler` har fire parametre (`err, req, res, next`) og hÃ¥ndterer fejl, der kastes eller sendes videre med `next(err)`.

## Test (Mat)

**1. Hvilke seks tests er der i api.test.js, og hvad dÃ¦kker de?**

Det er integrationstests af API'et. De starter appen, sender rigtige HTTP requests med `fetch` og tjekker svaret. Hver test fÃ¸lger Arrange, Act, Assert. De seks tests er listet under punkt 4.

**2. Hvorfor bruger de en fake repository, sÃ¥ de ikke rÃ¸rer data/tasks.json?**

`createApp` fÃ¥r sit repository som parameter: `createApp({ taskRepository })`. I produktion lÃ¦ser og skriver det `data/tasks.json`. I testene fÃ¥r den en fake, som gemmer opgaverne i en variabel i hukommelsen. Fake'en har de samme to metoder, `readTasks` og `writeTasks`, sÃ¥ appen opfÃ¸rer sig, som om den talte med det rigtige repository.

**3. Hvorfor bruger vi app.listen(0), og hvorfor lukker vi serveren i t.after?**

For at bruge `fetch` skal appen lytte pÃ¥ en port. En fast port som 3000 kan give konflikt, hvis den er optaget. Med `listen(0)` vÃ¦lger operativsystemet en ledig port, som testen aflÃ¦ser med `server.address().port`. `t.after(() => server.close())` lukker serveren, nÃ¥r testen er fÃ¦rdig, sÃ¥ porten ikke bliver hÃ¦ngende, og testprocessen kan afslutte.

**4. De seks tests**

* `getTasks_existingTasks_returns200AndList` kalder GET `/api/tasks` og tjekker 200 og at listen er den opgave, fake'en blev fyldt med.
* `postTasks_withText_returns201AndNewTask` sender en POST med teksten "Skriv tests" og forventer 201 og en ny opgave med id som string, den rigtige tekst og `done: false`.
* `postTasks_missingText_returns400` sender en POST med et tomt objekt og forventer 400. Det er en test af inputvalidering.
* `deleteTask_existingId_returns204` sletter en opgave, der findes, og forventer 204.
* `deleteTask_unknownId_returns404` sletter et id, der ikke findes, og forventer 404.
* `getUnknownRoute_unmatchedPath_returns404` kalder en sti, der ikke findes i appen, og forventer 404.

## AI brug (Mat)

Jeg bad Copilot om at skrive tests til API'et. Jeg rettede dem, sÃ¥ de fulgte Arrange, Act, Assert, og tjekkede, at de kÃ¸rte grÃ¸nt. Jeg fik ogsÃ¥ Copilot til at lave en plan for `api.test.js` og for `app.js` og `server.js`, da jeg lavede wiring. Jeg tjekkede diffen efter hver prompt for at sikre mig, at jeg forstod, hvad der blev lavet, og at det var korrekt.

## RefleksionsspÃ¸rgsmÃ¥l

### 1. Hvordan kunne man forhindre, at data bliver vÃ¦k ved crash?

Vi skriver hele `tasks.json` pÃ¥ Ã©n gang. Crasher serveren midt i, kan filen blive halv og Ã¸delagt. Man kunne skrive til en midlertidig fil fÃ¸rst og omdÃ¸be den, nÃ¥r den er helt fÃ¦rdig, sÃ¥ filen altid er hel. En backup af og til hjÃ¦lper ogsÃ¥.

### 2. Hvad ville du gÃ¸re anderledes med en database?

Nu lÃ¦ser og skriver vi hele filen, ogsÃ¥ nÃ¥r vi kun tilfÃ¸jer Ã©n opgave. En database kan Ã¦ndre Ã©n opgave ad gangen og klarer selv at gemme sikkert. Det er kun repository, der skulle skiftes ud, fordi de andre lag ikke ved, hvor data ligger.

### 3. Hvad sker der, hvis to brugere tilfÃ¸jer pÃ¥ samme tid?

Begge kan lÃ¦se den samme liste, fÃ¸r nogen har gemt. SÃ¥ tilfÃ¸jer hver sin opgave til sin egen kopi, og den der gemmer sidst overskriver den anden. Den ene opgave forsvinder uden en fejl. En kÃ¸, der gemmer Ã©n ad gangen, eller en database kunne lÃ¸se det.

### 4. Hvordan kunne man udvide med status, redigering eller deadlines?

`done` findes allerede pÃ¥ opgaven. Man kunne lave en PATCH route pÃ¥ `/api/tasks/:id`, der Ã¦ndrer `done` eller `text`, og en knap eller et afkrydsningsfelt i frontenden. En deadline kunne vÃ¦re et nyt felt som `dueDate`, som tjekkes i servicen. Ukendt id skal give 404, ligesom ved DELETE.

## Bonus

Efter feedback pÃ¥ Node ninja rettede vi disse ting i To Do Taming, sÃ¥ vi ikke gentager dem:

* `errorHandler` har de fire almindelige parametre, og vi justerede ESLint i stedet for at Ã¦ndre funktionens `length`.
* Agentinstruktionerne er forkortet fra ca. 12000 til ca. 2700 tegn, og reglerne, der tvang agenten til at omgÃ¥ ESLint, er fjernet.
* Servicen har rigtig logik (id, `done: false`, finde og slette), sÃ¥ laget kan begrundes.

Hvis vi skulle lave serveren igen med halvt sÃ¥ mange filer og regler, ville vi beholde service, repository og dependency injection, fordi de kan begrundes og testes. Vi ville fjerne `routes/`, `contracts.js` og de lange regelfiler.
