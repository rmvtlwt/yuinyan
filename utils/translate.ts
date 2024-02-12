import config from "../config.json" with { type: "json" };

export function translate(
	key: keyof typeof config.texts,
	args: Record<string, string>,
): string {
	const translated = config.texts[key];
	if (translated) {
		let fixedTranslate = translated;
		for (const [key, value] of Object.entries(args ?? {})) {
			fixedTranslate = fixedTranslate.replaceAll(`{${key}}`, value);
		}

		return fixedTranslate;
	} else {
		throw new Error("Invalid Translate Key");
	}
}
