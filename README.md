# To Do Taming

## Hvad laver programmet?

En fullstack app til opgaver (en "Taskmaster"). Backenden er en Express server, der gemmer opgaverne i en JSON fil uden database. Frontenden er en HTML side, der bruger `fetch` til at vise, tilføje og slette opgaver.

## Kom i gang

```bash
npm install
npm start
```

Åbn derefter `http://localhost:3000` i browseren.

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
| `src/routes/` | Kobler URL og metode til controlleren |
| `src/controllers/` | Læser request, tjekker input og vælger statuskode |
| `src/services/` | Forretningslogik |
| `src/repositories/` | Læser og skriver `data/tasks.json` |
| `src/middleware/` | 404 og fejlhåndtering |
| `data/tasks.json` | Opgaverne |
| `src/contracts.js` | Aftalte typer mellem lagene |

Flere regler står i [AGENTS.md](AGENTS.md) og test reglerne i [docs/unit-test-guide.md](docs/unit-test-guide.md).

## Frontend (Nicki)

Siden henter opgaver fra `/api/tasks` med `fetch`. Tilføj sender POST, slet sender DELETE, og listen hentes igen bagefter. Tekst sættes ind med `textContent` og ikke `innerHTML`, så HTML i en opgave ikke kan køre som kode (XSS). DELETE svarer 204 uden body, så der kaldes ikke `response.json()`. Ved fejl tjekkes `response.ok`, og en fejlbesked vises på siden.

## Fejlhåndtering og 404 (Nicki)

`notFound` svarer 404, når ingen route matcher. `errorHandler` svarer 400 ved ugyldig JSON (`err.type === 'entity.parse.failed'`) og 500 ved alt andet. Beskeden er altid en fast dansk tekst, aldrig `err.message` eller stack trace. Express kræver fire parametre for en fejlmiddleware, men ESLint vil ikke have ubrugt `next`, så længden sættes til 4 med `Object.defineProperty`.

## AI brug (Nicki)

Jeg brugte Copilot til frontenden og til 404 og fejlhåndtering. Jeg bad om en plan først, rettede den, læste diffen og kørte `npm run check`, før jeg lavede PR.

## Refleksionsspørgsmål

Skrives med egne ord.

1. Hvordan kunne man forhindre, at data bliver væk ved crash?
2. Hvad ville du gøre anderledes med en database?
3. Hvad sker der, hvis to brugere tilføjer på samme tid?
4. Hvordan kunne man udvide med status, redigering eller deadlines?

## Bonus

Hvad vi har lavet ud over kravene: