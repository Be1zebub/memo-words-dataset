# Memorable words dataset

Short & memorable (hope so) words/abbreviations dataset generator based on GCIDE, Wikipedia & FOSS.  
Dist contains 2861 words and 7184 abbreviations (atm).

## Words dataset generation

1. get <https://gcide.gnu.org.ua/> db & unpack to `gcide` dir
2. parse to json with `parse.js`
3. filter useless words & make dataset smaller (to use less llm context window) with `simplify.js`
4. filter useless words with LLM (gemini for huge context window), prompt example:
"filter out unpopular words, hard to read, hard to remember, and so on.
I need a list containing only memorable words (but list should still be quite large)."
5. format LLM output with `make-words-db.js`

## Abbreviations dataset generation

Run it step by step

### Wikipedia acronyms list

1. open <https://en.wikipedia.org/wiki/Lists_of_acronyms> in any browser
2. copy `abbr-scrapper.js` to your dev tools & run
3. put result into `wikipedia-abbr-db.json`

### FOSS acronyms

1. `git clone https://github.com/d-edge/foss-acronyms.git`
2. run `merge-foss-abbrs.js`

### Chat slang

1. download `slang.json` from <https://www.kaggle.com/datasets/gowrishankarp/chat-slang-abbreviations-acronyms> to `kaggle-slang.json`
2. run `make-abbrs-db.js` & we are done!

## Check results

1. check total abbrs/words count with `dist/how-much.js`
2. quality check - upload `dist/*.json` to LLM with prompt like "evaluate the quality of the datasets (these are lists of short, common, and memorable words and abbreviations)"
