---
name: min-stil
description: Mine farger, fonter og layoutregler for nettsider. Bruk når du lager eller endrer sider i oppgave-3-1-med, slik at alt får samme uttrykk som NVIDIA-landingssiden.
---

# Min stil

Bruk disse valgene når du lager nye sider eller komponenter. Ikke finn på nye farger eller fonter.

## Farger

Definer dem som CSS-variabler i `:root`:

| Variabel   | Hex       | Bruk                                                   |
|------------|-----------|--------------------------------------------------------|
| `--paper`  | `#e8ebe4` | Sidebakgrunn                                           |
| `--ink`    | `#191b18` | Tekst, knapper, kodeblokker                            |
| `--green`  | `#76b900` | Aksent: fylte flater, streker, lenker på mørk bakgrunn |
| `--forest` | `#10261f` | Mørke seksjoner                                        |
| `--line`   | `#c5cabd` | Skillelinjer på lys bakgrunn                           |
| `--muted`  | `#565c51` | Sekundærtekst                                          |

- Grønn brukes som flate eller strek, ikke som tekstfarge på lys bakgrunn (for lav kontrast).
- Feilmeldinger: `#b3261e`.

## Fonter

- Overskrifter: **Unbounded** 700, `line-height: 1.1`, `text-wrap: balance`.
- Brødtekst: **Instrument Sans** 400/500/600, `line-height: 1.6`, linjelengde under 80 tegn.
- Kode: `ui-monospace, "Cascadia Code", Consolas, monospace`.
- Last fra Google Fonts med `display=swap`.

## Layout og komponenter

- Alt er venstrejustert. Maks bredde på brødtekst ca. 40rem.
- Del opp innhold med rader og skillelinjer, ikke like kort med skygge.
- Knapper og lenker i menyen er pille-formede (`border-radius: 999px`), mørk bakgrunn på lys side og grønn på mørk.
- Kodeblokker har mørk bakgrunn og en grønn strek på venstre side.
- Skjema: synlig `label`, 2px mørk kant, grønn fokusring, feilmelding i tekst under feltet.

## Unngå

- Piler (→) på lenker, etiketter i store bokstaver og ett enkelt ord i annen farge i overskrifter.
- Skygger og gradienter som pynt.
- Animasjon som ikke er utløst av brukeren. Respekter `prefers-reduced-motion`.

## Kvalitetskrav

- Må fungere fra 375 px og opp, uten sidelengs scrolling.
- Synlig tastaturfokus, semantisk HTML og `alt`-tekst på bilder.
- Menyen blir en hamburger under 760 px.
- Skriv på norsk bokmål, i aktiv form, med setningsstor forbokstav.
