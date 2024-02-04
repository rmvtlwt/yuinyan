import { assertMatch } from "std/assert/mod.ts";

export function stringToBoolean(value: string): boolean {
	assertMatch(value, /^(true|false)$/);

	return value === "true";
}
