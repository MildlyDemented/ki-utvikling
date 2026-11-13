const readline = require('node:readline/promises');

async function main() {
    const input = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        const answer = (await input.question('Skriv inn et heltall: ')).trim();
        if (!/^[+-]?\d+$/.test(answer)) {
            console.log('Ugyldig input. Skriv inn et heltall.');
            return;
        }
        const number = BigInt(answer);
        console.log(number % 2n === 0n ? 'Partall' : 'Oddetall');
    } finally {
        input.close();
    }
}

main();
