const fs = require("fs")
const path = require("path")

// __dirname доступен сразу в CJS
const fossDir = path.join(__dirname, "foss-acronyms", "data")
const wikipediaPath = path.join(__dirname, "wikipedia-abbr-db.json")

// проверяем, существует ли файл
if (!fs.existsSync(wikipediaPath)) {
	console.error("Файл wikipedia-abbr-db.json не найден!")
	process.exit(1)
}

let wikipediaList
try {
	const data = fs.readFileSync(wikipediaPath, "utf8")
	wikipediaList = JSON.parse(data)
} catch (err) {
	console.error("Ошибка при чтении или парсинге wikipedia-abbr-db.json:", err)
	process.exit(1)
}

const fossList = []

if (fs.existsSync(fossDir)) {
	const fossFiles = fs.readdirSync(fossDir)
	for (const fileName of fossFiles) {
		const fullPath = path.join(fossDir, fileName)
		if (fs.statSync(fullPath).isDirectory()) continue

		try {
			const fileContent = fs.readFileSync(fullPath, "utf8")
			const fileJson = JSON.parse(fileContent)
			fileJson.forEach((item) => {
				if (item.Abbreviation) {
					fossList.push(item.Abbreviation.toUpperCase())
				}
			})
		} catch (err) {
			console.error(`Ошибка при обработке файла ${fileName}:`, err)
		}
	}
}

console.log(`Wikipedia list length: ${wikipediaList.length}`)
console.log(`FOSS list length: ${fossList.length}`)

const mergedList = Array.from(new Set([...wikipediaList, ...fossList]))
const filteredList = mergedList.filter(
	(abbr) => abbr.length >= 2 // meh, 1 character abbr, we dont need it
)
const howMuchFiltered = mergedList.length - filteredList.length

fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true })

fs.writeFileSync(
	path.join(__dirname, "dist", "abbr-db.json"),
	JSON.stringify(filteredList),
	"utf8"
)

console.log("Merge finished! Файл abbr-db.json создан.")
console.log(
	`Количество уникальных акронимов: ${filteredList.length} +${
		mergedList.length - wikipediaList.length
	} -${howMuchFiltered}`
)
