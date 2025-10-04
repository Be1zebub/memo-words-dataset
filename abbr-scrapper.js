;(async () => {
	function loadScript(src) {
		return new Promise((resolve, reject) => {
			const s = document.createElement("script")
			s.src = src
			s.onload = resolve
			s.onerror = reject
			document.head.appendChild(s)
		})
	}
	await loadScript(
		"https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"
	)

	const db = []
	const container = document.querySelector(
		"#mw-content-text > div.mw-content-ltr.mw-parser-output > div:nth-child(5) > ul"
	)
	const hyperLinks = container.querySelectorAll("li > a")

	for (let link of hyperLinks) {
		try {
			console.log(`Parsing page ${link.href}`)
			await parsePage(link.href, db)
		} catch (err) {
			console.log(`Failed to parse page ${link.href}`)
			console.error(err)
			break
		}
	}

	const uniqueResults = Array.from(new Set(db))
	console.log(JSON.stringify(uniqueResults))
	console.log(`Parsed ${uniqueResults.length} unique acronyms`)
})()

async function parsePage(href, db) {
	const res = await fetch(href)
	const html = await res.text()
	const doc = new DOMParser().parseFromString(html, "text/html")

	const contentContainer = doc.querySelector(
		"#mw-content-text > div.mw-content-ltr.mw-parser-output"
	)

	// im too lazy to parse Wikipedia, so next code is written by gemini-2.5-flash-preview-09-2025 (even havent read it)
	const allUls = contentContainer.querySelectorAll("ul")
	allUls.forEach((ul) => {
		// Проверяем, является ли <ul> списком акронимов:
		// - проверяем, что это не навигационный список (например, с классом .references или .column-count)
		// - проверяем, что в нем есть хотя бы один элемент, который содержит разделитель " – "

		// Пропуск списков с известными "мусорными" классами (например, ссылки)
		if (
			ul.className.includes("references") ||
			ul.className.includes("column-count")
		) {
			return
		}

		// Получаем все <li> из текущего <ul>
		const liItems = ul.querySelectorAll("li")
		let isAcronymList = false
		const tempResults = []

		// Проверяем первые 5 элементов (или меньше) на наличие структуры акронима
		const itemsToCheck = Array.from(liItems).slice(0, 5)

		itemsToCheck.forEach((li) => {
			const text = li.textContent.trim()
			// Типичный формат: АКРОНИМ – Определение
			if (text.includes(" – ")) {
				tempResults.push(text)
				isAcronymList = true // Если хотя бы один элемент соответствует, считаем список целевым
			}
		})

		// Если список признан списком акронимов, добавляем все его элементы
		if (isAcronymList) {
			// Если мы уже сохранили несколько элементов для проверки, то добавляем их.
			// Затем проходим по остальным элементам списка (если есть).

			// В данном случае, проще собрать ВСЕ элементы списка, если он валиден.
			liItems.forEach((li) => {
				const textContent = li.textContent.trim()
				// Дополнительная проверка на пустые строки или элементы-ссылки, которые не акронимы
				if (
					textContent.length > 3 &&
					(textContent.includes(" – ") || textContent.includes(" –"))
				) {
					const match = textContent.match(/^\w+/)
					const firstWord = match ? match[0] : ""

					db.push(firstWord.toUpperCase())
				}
			})
		}
	})
}
