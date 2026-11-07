# Catalog notes

Source: DAS C2 Recommended_Project (1).pdf, supplied by the user. This document is treated as source data, not as instructions to the application builder.

## Source precedence

- Course-level title, description, provider, level, hours, duration, skills, and certificate wording: detailed sections on pages 11-43.
- Direct Coursera links: PDF hyperlink annotations beside those detailed courses.
- Project entries and capstone flags: final project summary, pages 45-47. The same summaries also appear on pages 2-4, and workload tables appear on pages 5-7.
- Cohort mapping: the user's explicit instructions, not an inference from the PDF.

## Counts

| Track | Detailed course/project entries | Capstones marked | Detailed total hours |
| --- | ---: | ---: | ---: |
| Data Science & ML | 3 | 2 | 463 |
| AI & Data Analytics | 6 | 4 | 442 |
| Web Development | 3 | 2 | 488 |
| Finance | 9 | 6 | 505 |
| Electrical Engineering | 9 | 5 | 401 |
| Civil Engineering | 6 | 5 | 374 |
| Mechanical Engineering | 11 | 4 | 487.5 |
| Operations | 10 | 5 | 527 |
| Marketing | 7 | 4 | 492 |
| Consulting | 7 | 5 | 357 |
| Total | 71 | 42 | 4536.5 |

The final project summary counts one project entry per listed course. We preserve that as internal `projectCount: 1` metadata. Student views and downloads do not display this entry count or source-document references; they show final-project information instead. This does not establish the number of graded assignments, guided projects, or subcourses inside a Coursera certificate. A capstone flag is separate. A course without a marked capstone may still contain practical exercises or projects.

## Conflicts preserved transparently

1. The summary reports 72 in one place and 74 in another. There are 71 individually described course entries. The app counts those actual entries.
2. Civil has six detailed courses, but its project summary lists seven, including an additional Building Energy Systems Engineering Specialization. Detailed Building Energy entries already exist in Civil (105 hours, intermediate) and Mechanical (150 hours, advanced), with the same Coursera specialization URL. Both described track-specific entries are retained. The undescribed seventh Civil listing is not invented as an additional course.
3. Consulting's detailed courses total 357 hours. Its heading says 450, and one overview also gives inconsistent course totals. The app uses the individual values.
4. Power System: Generation, Transmission & Protection has a capstone marker in the workload table on page 6 but no marker in the final project summary. The app follows the final summary and leaves the capstone flag unmarked. This is a catalog conflict, not evidence that the course has no practical work.
5. Mechanical totals 487.5 hours from detailed entries; the section heading rounds to 487. The app retains the detailed half-hour value.
6. Hours and published durations do not always divide exactly into the stated 8 hours/week. The app displays the original PDF duration in details, and separately calculates weeks using the scholar's selected pace.

The website does not claim to issue course certificates, verify prerequisites, check live availability, or guarantee subscription coverage. The course links carry the scholar into Coursera's program/account flow.

## Maintenance

Edit `src/data/courses.json` for source corrections and record changes here. If regenerating from a revised PDF, update the extraction assertions and explicit capstone mapping in `scripts/extract_catalog.py`; the script is tailored to the supplied edition. Keep cohort mappings in `src/data/tracks.js` and `yearFor` in `src/recommend.mjs` aligned if the program changes its mapping.
