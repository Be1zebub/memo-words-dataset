const fs = require("fs")
const path = require("path")

const mergedAbbrs = JSON.parse(
	fs.readFileSync(path.join(__dirname, "merged-abbrs.json"), "utf8")
)
const slangAbbrs = JSON.parse(
	fs.readFileSync(path.join(__dirname, "kaggle-slang.json"), "utf8")
)

const slangResult = Object.keys(slangAbbrs)
	.filter((key) => {
		return key.length >= 2 && key.length <= 6
	})
	.map((key) => key.toUpperCase())
const filteredList = Array.from(new Set([...mergedAbbrs, ...slangResult]))

fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true })
fs.writeFileSync(
	path.join(__dirname, "dist", "abbr-db.json"),
	JSON.stringify(filteredList),
	"utf8"
)

console.log(`Added ${filteredList.length - slangResult.length} abbreviations`)
