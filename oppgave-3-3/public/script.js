const startSkjema = document.getElementById("start-skjema");
const quizSkjema = document.getElementById("quiz-skjema");
const resultat = document.getElementById("resultat");
const navnFelt = document.getElementById("navn");
const navnFeil = document.getElementById("navn-feil");
const quizFeil = document.getElementById("quiz-feil");
const neste = document.getElementById("neste");

let spørsmål = [];
let svar = [];
let nåværende = 0;
let navn = "";

async function hentJson(url, valg) {
  const respons = await fetch(url, valg);
  const data = await respons.json().catch(() => ({}));
  if (!respons.ok) throw new Error(data.error || "Noe gikk galt. Prøv igjen.");
  return data;
}

function visHighscore(liste) {
  const ol = document.getElementById("liste");
  ol.replaceChildren();
  document.getElementById("tom").hidden = liste.length > 0;

  for (const { name, score } of liste) {
    const li = document.createElement("li");
    li.append(name);
    const poeng = document.createElement("span");
    poeng.className = "poeng";
    poeng.textContent = score;
    li.append(poeng);
    ol.append(li);
  }
}

async function lastHighscore() {
  try {
    visHighscore(await hentJson("/api/highscores"));
  } catch (err) {
    document.getElementById("tom").hidden = false;
    document.getElementById("tom").textContent = err.message;
  }
}

function visSpørsmål() {
  const { question, options } = spørsmål[nåværende];
  document.getElementById("fremdrift").textContent = `Spørsmål ${nåværende + 1} av ${spørsmål.length}`;
  document.getElementById("spørsmål").textContent = question;
  neste.textContent = nåværende === spørsmål.length - 1 ? "Send inn" : "Neste";
  quizFeil.hidden = true;

  const valg = document.getElementById("valg");
  valg.replaceChildren();
  options.forEach((tekst, i) => {
    const label = document.createElement("label");
    label.className = "choice";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "svar";
    input.value = i;
    label.append(input, tekst);
    valg.append(label);
  });
  valg.querySelector("input").focus();
}

startSkjema.addEventListener("submit", async (e) => {
  e.preventDefault();
  navn = navnFelt.value.trim();
  navnFeil.hidden = navn.length >= 1 && navn.length <= 20;
  if (!navnFeil.hidden) return navnFelt.focus();

  try {
    spørsmål = await hentJson("/api/questions");
  } catch (err) {
    navnFeil.textContent = err.message;
    navnFeil.hidden = false;
    return;
  }

  svar = [];
  nåværende = 0;
  startSkjema.hidden = true;
  quizSkjema.hidden = false;
  visSpørsmål();
});

quizSkjema.addEventListener("submit", async (e) => {
  e.preventDefault();
  const valgt = quizSkjema.querySelector("input[name=svar]:checked");
  if (!valgt) {
    quizFeil.textContent = "Velg et svar for å gå videre.";
    quizFeil.hidden = false;
    return;
  }

  svar.push(Number(valgt.value));
  if (nåværende < spørsmål.length - 1) {
    nåværende++;
    return visSpørsmål();
  }

  neste.disabled = true;
  try {
    const data = await hentJson("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: navn, answers: svar }),
    });
    visResultat(data);
  } catch (err) {
    quizFeil.textContent = err.message;
    quizFeil.hidden = false;
    svar.pop();
  } finally {
    neste.disabled = false;
  }
});

function visResultat({ score, total, correct, highscores }) {
  quizSkjema.hidden = true;
  resultat.hidden = false;
  document.getElementById("poeng").textContent = `${navn}, du fikk ${score} av ${total}`;

  const liste = document.getElementById("gjennomgang");
  liste.replaceChildren();
  spørsmål.forEach((s, i) => {
    const li = document.createElement("li");
    const riktig = svar[i] === correct[i];
    li.className = riktig ? "rett" : "feil";
    li.textContent = riktig
      ? `${s.question} – riktig`
      : `${s.question} – feil, riktig svar er «${s.options[correct[i]]}»`;
    liste.append(li);
  });

  visHighscore(highscores);
  document.getElementById("igjen").focus();
}

document.getElementById("igjen").addEventListener("click", () => {
  resultat.hidden = true;
  startSkjema.hidden = false;
  navnFelt.value = "";
  navnFelt.focus();
});

lastHighscore();
