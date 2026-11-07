# Course Compass

A course recommendation website for the Dell Aspire Scholars Program, using the supplied NavGurukul/Coursera course catalog. Built with React and Vite. No backend, login, LLM, database, or API key is required.

## Run locally

Requires Node.js 22.12+ (Node.js 24 is recommended).

```sh
npm ci
npm run dev
```

On Windows PowerShell with script execution disabled, use `npm.cmd` in place of `npm`.

## Deploy to Vercel

Push this folder to a Git repository, then import that repository into Vercel. Use:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none

The included `vercel.json` supplies the build settings. Alternatively run `npx vercel` from this directory with your Vercel account. Deployment is not performed or linked to an account by this project.

Official setup reference: https://vercel.com/docs/frameworks/frontend/vite

## What it does

The four-step questionnaire asks for an interest track, subject familiarity, Coursera project experience and domain, optional completed courses, cohort or college year, learning goal, weekly hours, and preferred completion window. Results show a relevance rating, explanation, course level, learning hours, estimated weeks, final-project indicator, skills, certificate information, and the original Coursera link.

Scholars can edit their answers, browse and filter the whole catalog, save a shortlist, and download their recommendation table as CSV. The shortlist stays in local browser storage; questionnaire answers stay only in memory. Fonts are bundled locally. Fonts, logos, and photography are served locally. External websites open only when a scholar follows an external link.

## How matching works

Interest restricts recommendations to the chosen track (30 points). Readiness contributes up to 30 points, the learning goal up to 20, time fit up to 15, and college stage up to 5. The scoring weights are editorial product rules, not scientifically validated predictions.

The level decision is intentionally independent of college year:

| Subject knowledge | No same-domain Coursera project | Completed same-domain Coursera project |
| --- | --- | --- |
| New to the field | Beginner | Beginner; foundations still needed |
| Some basics | Beginner | Intermediate |
| Confident foundations | Intermediate | Advanced |

A project in another domain does not qualify as same-domain experience. A same-domain project provides a modest additional preference for substantial capstone work when the goal is skills, portfolio, or career preparation. It does not override an introductory goal or readiness. Marking a course complete excludes it; it does not independently change the scholar's self-reported subject readiness.

Cohort 2 maps to third year and Cohort 3 to second year, following the program's supplied mapping. These mappings are explicit and do not change with the calendar. Another cohort requires the scholar to select their college year. Cohort never forces advanced courses. Beginners in either cohort can receive foundation courses. Exploring favours manageable foundation courses without marked capstones; portfolio goals favour capstones.

Estimated weeks are total hours / weekly hours, rounded up. The completion windows are 4, 12, or 24 weeks, or flexible. Courses needing preparation are capped at 54/100, and courses beyond the time window at 69/100. Ordering prioritizes readiness, then time fit, then fit score; PDF sequence breaks ties. Stars round the score divided by 20. These are recommendation stars, not Coursera ratings or a completion probability. Out-of-window and preparation options remain visible with explicit labels. If nothing fits, the website explains that instead of presenting a false best match.

## Catalog and source caveats

See [CATALOG_NOTES.md](CATALOG_NOTES.md). The runtime data is [src/data/courses.json](src/data/courses.json), the matching engine is [src/recommend.mjs](src/recommend.mjs), and questionnaire options are [src/data/tracks.js](src/data/tracks.js).

To regenerate the catalog using Python with `pypdf` installed:

```sh
python scripts/extract_catalog.py "path/to/DAS C2 Recommended_Project (1).pdf"
```

The supplied PDF is not bundled in the public site. Its course facts are embedded in the catalog. Hyperlinks are extracted from PDF annotations, with advertising query parameters removed and program-specific URLs retained. Current course availability or subscription eligibility is not independently verified.

## Verification

```sh
npm test
npm run build
npm run preview
```

Engine tests check catalog integrity, cohort treatment, project-domain effects, time constraints, completed-course exclusion, civil beginner limitations, CSV output, and 11,520 valid matching profiles. DOM tests exercise questionnaire validation, conditional project-domain selection, recommendations, edit flow, catalog search/filtering, course dialogs, CSV downloads, and local shortlists. Automated DOM checks do not replace visual browser QA.

Image and logo provenance: [ASSET_SOURCES.md](ASSET_SOURCES.md).
