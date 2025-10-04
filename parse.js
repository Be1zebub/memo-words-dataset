const fs = require("fs")
const path = require("path")
const cheerio = require("cheerio") // Импортируем cheerio

// Класс для одной словарной статьи
class GcideEntry {
	constructor(headword) {
		this.headword = headword
		this.partsOfSpeech = []
		this.definitions = []
		this.pronunciation = null
		this.etymology = null
		this.synonyms = []
		this.alternativeNames = []
		this.alternativeSpellings = []
		this.collocationSections = []
	}

	toString() {
		return (
			`GcideEntry(headword='${this.headword}', pos=${this.partsOfSpeech.length}, ` +
			`defs=${this.definitions.length}, pron='${this.pronunciation}', ` +
			`syns=${this.synonyms.length})`
		)
	}

	toDict() {
		return {
			headword: this.headword,
			partsOfSpeech: this.partsOfSpeech,
			pronunciation: this.pronunciation,
			etymology: this.etymology,
			definitions: this.definitions,
			synonyms: this.synonyms,
			alternativeNames: this.alternativeNames,
			alternativeSpellings: this.alternativeSpellings,
			collocationSections: this.collocationSections,
		}
	}
}

// Класс парсера
class GcideParser {
	constructor() {
		this._commentPattern = /<!--.*?-->/gs
	}

	_getTextContent(element) {
		const $ = cheerio.load(element.html() || "", null, false) // Handle potential null/undefined html
		;[
			"b",
			"it",
			"rj",
			"qex",
			"chform",
			"centered",
			"point26",
			"ets",
			"fld",
			"as",
			"au",
			"q",
		].forEach((tag) => {
			$(tag).each((i, el) => {
				$(el).replaceWith($(el).contents())
			})
		})
		// Replace <br/> with newline before getting text
		$("br").replaceWith("\n")
		return $.text().trim()
	}

	parseFile(filePath) {
		const content = fs.readFileSync(filePath, "utf-8")
		let cleanedContent = content.replace(this._commentPattern, "")
		const $ = cheerio.load(cleanedContent, {
			xmlMode: false,
			decodeEntities: false,
		})

		const entries = []
		let currentEntry = null

		$("p").each((index, element) => {
			const $p = $(element) // Use $p to refer to the current paragraph element

			const entElement = $p.find("ent")
			if (entElement.length > 0) {
				const headword = this._getTextContent(entElement)
				if (currentEntry) {
					entries.push(currentEntry)
				}
				currentEntry = new GcideEntry(headword)
			}

			if (!currentEntry) {
				return // Skip if no entry has been started yet
			}

			const hwElement = $p.find("hw")
			if (hwElement.length > 0 && !currentEntry.headword) {
				currentEntry.headword = this._getTextContent(hwElement)
			}

			const prElement = $p.find("pr")
			if (prElement.length > 0 && !currentEntry.pronunciation) {
				currentEntry.pronunciation = this._getTextContent(prElement)
			}

			$p.find("pos").each((i, el) => {
				const posText = this._getTextContent($(el))
				if (posText && !currentEntry.partsOfSpeech.includes(posText)) {
					currentEntry.partsOfSpeech.push(posText)
				}
			})

			const etyElement = $p.find("ety")
			if (etyElement.length > 0 && !currentEntry.etymology) {
				currentEntry.etymology = this._getTextContent(etyElement)
			}

			$p.find("def").each((i, defEl) => {
				const $defEl = $(defEl)
				const defText = this._getTextContent($defEl)
				let senseNumber = null

				let prevSibling = $defEl.prev()
				while (prevSibling.length > 0 && !prevSibling.is("sn")) {
					prevSibling = prevSibling.prev()
				}
				if (prevSibling.is("sn")) {
					senseNumber = this._getTextContent(prevSibling)
				}

				const illustrations = $defEl
					.find("as")
					.map((j, el) => this._getTextContent($(el)))
					.get()

				const quotations = $defEl
					.find("q")
					.map((j, qEl) => {
						const $qEl = $(qEl)
						const qText = this._getTextContent(
							$qEl.clone().find("rj").remove().end()
						)
						const auElement = $qEl.find("au")
						const author =
							auElement.length > 0 ? this._getTextContent(auElement) : null
						return { text: qText, author: author }
					})
					.get()

				const definitionEntry = {
					senseNumber: senseNumber,
					text: defText,
					illustrations: illustrations,
					quotations: quotations,
					sources: [],
				}
				currentEntry.definitions.push(definitionEntry)
			})

			const sources = $p
				.find("source")
				.map((i, el) => this._getTextContent($(el)))
				.get()
			if (sources.length > 0) {
				if (currentEntry.definitions.length > 0) {
					currentEntry.definitions[
						currentEntry.definitions.length - 1
					].sources.push(...sources)
				} else {
					currentEntry.definitions.push({
						senseNumber: null,
						text: "",
						illustrations: [],
						quotations: [],
						sources: sources,
					})
				}
			}

			$p.find("syn").each((i, el) => {
				const synText = this._getTextContent($(el))
				const synonymsList = synText
					.split(",")
					.map((s) => s.trim())
					.filter((s) => s)
				synonymsList.forEach((s) => {
					if (!currentEntry.synonyms.includes(s)) {
						currentEntry.synonyms.push(s)
					}
				})
			})

			$p.find("altname").each((i, el) => {
				const altnameText = this._getTextContent($(el))
				if (
					altnameText &&
					!currentEntry.alternativeNames.includes(altnameText)
				) {
					currentEntry.alternativeNames.push(altnameText)
				}
			})

			$p.find("asp").each((i, el) => {
				const aspText = this._getTextContent($(el))
				if (aspText && !currentEntry.alternativeSpellings.includes(aspText)) {
					currentEntry.alternativeSpellings.push(aspText)
				}
			})

			$p.find("cs").each((i, csEl) => {
				const collocations = []
				$(csEl)
					.find("col")
					.each((j, colEl) => {
						const colText = this._getTextContent($(colEl))
						const cdElement = $(colEl).next("cd")
						if (cdElement.length > 0) {
							const cdText = this._getTextContent(cdElement)
							collocations.push({ collocation: colText, definition: cdText })
						}
					})
				if (collocations.length > 0) {
					currentEntry.collocationSections.push({ collocations: collocations })
				}
			})
		})

		if (currentEntry) {
			entries.push(currentEntry)
		}

		return entries
	}
}

// Пример использования:
async function main() {
	const parser = new GcideParser()
	const gcideDir = path.join(__dirname, "gcide")
	const outputFilePath = path.join(__dirname, "parsed-cide.json")
	const allParsedEntries = []

	const files = fs.readdirSync(gcideDir)
	const cideFiles = files.filter(
		(file) => file.startsWith("CIDE.") && !file.endsWith(".json")
	) // Исключаем возможные json файлы
	cideFiles.sort() // Парсить в алфавитном порядке, если это важно

	console.log(`Found GCIDE files to parse: ${cideFiles.join(", ")}`)

	for (const fileName of cideFiles) {
		const filePath = path.join(gcideDir, fileName)
		try {
			console.log(`Parsing ${filePath}...`)
			const entries = parser.parseFile(filePath)
			allParsedEntries.push(...entries.map((entry) => entry.toDict()))
			console.log(`Parsed ${entries.length} entries from ${fileName}`)
		} catch (error) {
			console.error(`Error parsing ${filePath}:`, error)
		}
	}

	// 2. Сохранение результата в JSON-файл
	try {
		await fs.promises.writeFile(
			outputFilePath,
			JSON.stringify(allParsedEntries, null, 2),
			"utf-8"
		)
		console.log(`All parsed entries saved to ${outputFilePath}`)
	} catch (error) {
		console.error(`Error writing output file ${outputFilePath}:`, error)
	}

	// Опционально: очистка фиктивных файлов
	// for (const fileName in sampleContents) {
	//     const filePath = path.join(gcideDir, fileName);
	//     fs.unlinkSync(filePath);
	//     console.log(`Removed dummy file: ${filePath}`);
	// }
	// fs.rmdirSync(gcideDir);
	// console.log(`Removed directory: ${gcideDir}`);
}

main().catch(console.error)
