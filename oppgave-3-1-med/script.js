const TOTAL = 288;
const STEP_MS = 90;
const CPU_WORKERS = 6;
const GPU_WORKERS = 48;

const startKnapp = document.getElementById("start");
const resultat = document.getElementById("resultat");
const reduserBevegelse = window.matchMedia("(prefers-reduced-motion: reduce)");

const baner = [
  { felt: document.getElementById("cpu"), teller: document.getElementById("cpu-steg"), arbeidere: CPU_WORKERS },
  { felt: document.getElementById("gpu"), teller: document.getElementById("gpu-steg"), arbeidere: GPU_WORKERS },
];

for (const bane of baner) {
  bane.ruter = Array.from({ length: TOTAL }, () => bane.felt.appendChild(document.createElement("i")));
}

function nullstill() {
  for (const bane of baner) {
    bane.ruter.forEach((rute) => rute.classList.remove("done"));
    bane.teller.textContent = "0 steg";
    bane.steg = 0;
  }
}

function stegBane(bane) {
  const fra = bane.steg * bane.arbeidere;
  if (fra >= TOTAL) return false;
  for (let i = fra; i < Math.min(fra + bane.arbeidere, TOTAL); i++) bane.ruter[i].classList.add("done");
  bane.steg++;
  bane.teller.textContent = `${bane.steg} steg`;
  return true;
}

function visResultat() {
  const [cpu, gpu] = baner;
  resultat.textContent = `GPU-en var ferdig på ${gpu.steg} steg, CPU-en trengte ${cpu.steg}. Det er ${Math.round(cpu.steg / gpu.steg)} ganger færre steg.`;
  startKnapp.disabled = false;
  startKnapp.textContent = "Kjør på nytt";
}

startKnapp.addEventListener("click", () => {
  nullstill();
  startKnapp.disabled = true;
  resultat.textContent = "Regner …";

  if (reduserBevegelse.matches) {
    while (baner.map(stegBane).some(Boolean));
    visResultat();
    return;
  }

  const timer = setInterval(() => {
    const aktive = baner.map(stegBane);
    if (!aktive.some(Boolean)) {
      clearInterval(timer);
      visResultat();
    }
  }, STEP_MS);
});

nullstill();

// Meny
const menyKnapp = document.querySelector(".menu-toggle");
const meny = document.getElementById("meny");

function settMeny(apen) {
  menyKnapp.setAttribute("aria-expanded", String(apen));
  meny.classList.toggle("open", apen);
}

menyKnapp.addEventListener("click", () => settMeny(menyKnapp.getAttribute("aria-expanded") !== "true"));
meny.addEventListener("click", (e) => { if (e.target.closest("a")) settMeny(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menyKnapp.getAttribute("aria-expanded") === "true") {
    settMeny(false);
    menyKnapp.focus();
  }
});

// Kontaktskjema: valideres i nettleseren, det sendes ingenting
const skjema = document.getElementById("skjema");
const skjemaStatus = document.getElementById("skjema-status");

skjema.addEventListener("submit", (e) => {
  e.preventDefault();
  let forste = null;

  for (const felt of skjema.querySelectorAll("input, textarea")) {
    const feil = document.getElementById(`${felt.id}-feil`);
    const gyldig = felt.checkValidity();
    feil.hidden = gyldig;
    felt.setAttribute("aria-invalid", String(!gyldig));
    if (!gyldig && !forste) forste = felt;
  }

  if (forste) {
    skjemaStatus.textContent = "";
    forste.focus();
    return;
  }

  skjema.reset();
  skjemaStatus.textContent = "Takk! Skjemaet er fylt ut riktig, men meldingen er ikke sendt: dette er en demoside uten server.";
});
