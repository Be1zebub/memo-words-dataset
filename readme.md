# Memorable words dataset

Short & memorable (hope so) words/abbreviations dataset generator based on GCIDE, Wikipedia & FOSS.

## Words dataset generation

1. get <https://gcide.gnu.org.ua/> db & unpack to `gcide` dir
2. parse to json with `parse.js`
3. filter useless words & make dataset smaller (to use less llm context window) with `simplify.js`
4. filter useless words with LLM (gemini for huge context window), prompt example:
"filter out unpopular words, hard to read, hard to remember, and so on.
I need a list containing only memorable words (but list should still be quite large)."
5. format LLM output with `make-db.js`

## Abbreviations dataset generation

### Wikipedia acronyms list

1. open <https://en.wikipedia.org/wiki/Lists_of_acronyms> in any browser
2. copy `abbr-scrapper.js` to your dev tools & run
3. put result into `wikipedia-abbr-db.json`

### FOSS acronyms

1. `git clone https://github.com/d-edge/foss-acronyms.git`
2. run `merge-abbrs.js`
