import tweetnacl from "npm:tweetnacl@1.0.3";
import { decodeHex } from "std/encoding/hex.ts";
import { STATUS_CODE } from "std/http/status.ts";

import {
	type APIInteraction,
	InteractionResponseType,
} from "discord_api_types";
import { isPingInteraction } from "./utils/interaction.ts";

async function handler(request: Request): Promise<Response> {
	const invalidRequest = new Response("Invalid request.", {
		status: STATUS_CODE.Unauthorized,
	});
	if (request.method != "POST") {
		return invalidRequest;
	} else {
		const requiredHeaders = [
			"x-signature-timestamp",
			"x-signature-ed25519",
		];
		if (!requiredHeaders.every((header) => request.headers.has(header))) {
			return invalidRequest;
		} else {
			const body = await request.text();
			const [timestamp, signature] = requiredHeaders.map((header) =>
				request.headers.get(header)
			);

			const valid = tweetnacl.sign.detached.verify(
				new TextEncoder().encode(timestamp + body),
				decodeHex(signature!),
				decodeHex(Deno.env.get("DISCORD_PUBLIC_KEY")!),
			);

			if (!valid) {
				return invalidRequest;
			} else {
				const interaction: APIInteraction = JSON.parse(body);
				if (isPingInteraction(interaction)) {
					return Response.json({
						type: InteractionResponseType.Pong,
					});
				} else {
					console.log(interaction);
					return new Response(
						`Unknown interaction type. (${interaction.type})`,
					);
				}
			}
		}
	}
}

Deno.serve(handler);
