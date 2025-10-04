const fs = require("fs")
const path = require("path")

const wordsDb = JSON.parse(
	fs.readFileSync(path.join(__dirname, "words-db.json"), "utf8")
)
const abbrDb = JSON.parse(
	fs.readFileSync(path.join(__dirname, "abbr-db.json"), "utf8")
)

let totalWords = 0
for (const len in wordsDb) {
	totalWords += wordsDb[len].length
}

console.log(`${totalWords} words and ${abbrDb.length} abbreviations`)
