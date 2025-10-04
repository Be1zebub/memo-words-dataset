const fs = require("fs")
const path = require("path")

const parsedPath = path.join(__dirname, "parsed-cide.json")
const simplifiedPath = path.join(__dirname, "simplified-cide.json")

const parsedData = JSON.parse(fs.readFileSync(parsedPath, "utf8"))
const simplifiedData = parsedData
	.filter((item) => {
		if (
			item.headword.length > 1 &&
			item.headword.length <= 8 &&
			isNaN(Number(item.headword))
		) {
			if (/^\d+(st|nd|rd|th)$/.test(item.headword)) return

			return item.headword
		}
	})
	.map((item) => {
		return item.headword
	})

fs.writeFileSync(simplifiedPath, JSON.stringify(simplifiedData))
