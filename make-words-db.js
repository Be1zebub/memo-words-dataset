const fs = require("fs")
const path = require("path")

const bestWordsPath = path.join(__dirname, "best-words.txt")
const databasePath = path.join(__dirname, "dist", "words-db.json")

fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true })

const bestWords = fs
	.readFileSync(bestWordsPath, "utf8")
	.replace(/\.$/, "")
	.split(",")
	.map((s) => s.trim())

const database = {}
bestWords.forEach((word) => {
	const len = word.length
	let arr = database[len]

	if (!arr) {
		arr = []
		database[len] = arr
	}

	arr.push(word)
})

fs.writeFileSync(databasePath, JSON.stringify(database))
