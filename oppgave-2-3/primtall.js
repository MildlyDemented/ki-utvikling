const readline = require('node:readline/promises');
const { performance } = require('node:perf_hooks');

function nthPrime(n) {
    // For n >= 6 er n * (ln n + ln ln n) en øvre grense.
    const limit = n < 6 ? 15 : Math.ceil(n * (Math.log(n) + Math.log(Math.log(n))));
    const composite = new Uint8Array(limit + 1);

    for (let p = 2; p * p <= limit; p++) {
        if (composite[p]) continue;
        // Mindre multipler er allerede markert av en mindre faktor.
        for (let multiple = p * p; multiple <= limit; multiple += p) {
            composite[multiple] = 1;
        }
    }

    let count = 0;
    for (let candidate = 2; candidate <= limit; candidate++) {
        if (!composite[candidate] && ++count === n) return candidate;
    }
    throw new Error('Fant ikke primtallet innenfor grensen.');
}

async function main() {
    const input = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        const answer = (await input.question('Hvilket primtall vil du finne? Skriv T: ')).trim();
        const n = Number(answer);
        if (!/^\d+$/.test(answer) || n < 1 || n > 1_000_000) {
            console.log('Skriv et heltall fra 1 til 1 000 000.');
            return;
        }
        const start = performance.now();
        const prime = nthPrime(n);
        console.log(`Primtall nr. ${n} er ${prime}.`);
        console.log(`Beregningstid: ${(performance.now() - start).toFixed(1)} ms`);
    } finally {
        input.close();
    }
}

main();
