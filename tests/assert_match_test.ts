import { assertMatch } from "std/assert/assert_match.ts";

try {
	assertMatch("False", /^(true|false)$/, "invalid-char");
} catch (err) {
	console.log(err.message);
}
