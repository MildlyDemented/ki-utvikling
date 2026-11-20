const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");
const MAX_HIGHSCORES = 10;

// Riktig svar er indeksen i `options`. Svarene sendes aldri til nettleseren.
const QUESTIONS = [
  { question: "Hva heter hovedstaden i Litauen?", options: ["Riga", "Vilnius", "Tallinn", "Warszawa"], correct: 1 },
  { question: "Hva står CPU for?", options: ["Central Processing Unit", "Computer Personal Unit", "Core Power Utility", "Central Program Update"], correct: 0 },
  { question: "Hvilket av tallene er et primtall?", options: ["21", "27", "29", "33"], correct: 2 },
  { question: "Hvilket språk kjører direkte i nettleseren?", options: ["Python", "C#", "Java", "JavaScript"], correct: 3 },
  { question: "Hvilken HTTP-statuskode betyr «ikke funnet»?", options: ["200", "404", "500", "301"], correct: 1 },
];

const app = express();
app.use(express.json({ limit: "2kb" }));
app.use(express.static(path.join(__dirname, "public")));

async function readScores() {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

// Skriver til en midlertidig fil først, så data.json aldri blir halvskrevet.
async function writeScores(scores) {
  const tmp = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(scores, null, 2));
  await fs.rename(tmp, DATA_FILE);
}

// Lagring skjer ett kall om gangen slik at to samtidige innsendinger ikke overskriver hverandre.
let lagreKø = Promise.resolve();
function lagre(nyttResultat) {
  const jobb = lagreKø.then(async () => {
    const scores = await readScores();
    scores.push(nyttResultat);
    await writeScores(scores);
  });
  lagreKø = jobb.catch(() => {});
  return jobb;
}

function sorter(scores) {
  return [...scores]
    .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
    .slice(0, MAX_HIGHSCORES);
}

app.get("/api/questions", (req, res) => {
  res.json(QUESTIONS.map(({ question, options }) => ({ question, options })));
});

app.get("/api/highscores", async (req, res, next) => {
  try {
    res.json(sorter(await readScores()));
  } catch (err) {
    next(err);
  }
});

app.post("/api/submit", async (req, res, next) => {
  try {
    const { name, answers } = req.body ?? {};

    if (typeof name !== "string" || name.trim().length < 1 || name.trim().length > 20) {
      return res.status(400).json({ error: "Navnet må være fra 1 til 20 tegn." });
    }

    const gyldigeSvar =
      Array.isArray(answers) &&
      answers.length === QUESTIONS.length &&
      answers.every((a, i) => Number.isInteger(a) && a >= 0 && a < QUESTIONS[i].options.length);

    if (!gyldigeSvar) {
      return res.status(400).json({ error: `Send ett gyldig svar for hvert av de ${QUESTIONS.length} spørsmålene.` });
    }

    const score = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
    await lagre({ name: name.trim(), score, date: new Date().toISOString() });

    res.status(201).json({
      score,
      total: QUESTIONS.length,
      correct: QUESTIONS.map((q) => q.correct),
      highscores: sorter(await readScores()),
    });
  } catch (err) {
    next(err);
  }
});

app.use("/api", (req, res) => res.status(404).json({ error: "Fant ikke endepunktet." }));

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed" || err.type === "entity.too.large") {
    return res.status(400).json({ error: "Ugyldig forespørsel." });
  }
  console.error(err);
  res.status(500).json({ error: "Noe gikk galt på serveren." });
});

app.listen(PORT, () => console.log(`Server kjører på http://localhost:${PORT}`));
