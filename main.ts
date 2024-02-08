import tweetnacl from "npm:tweetnacl@1.0.3";
import { decodeHex } from "std/encoding/hex.ts";
import { STATUS_CODE } from "std/http/status.ts";

import {
	type APIChatInputApplicationCommandInteraction,
	type APIInteraction,
	InteractionResponseType,
	Routes,
} from "discord_api_types";
import { REST } from "@discordjs/rest";

import manifestGen from "./manifest.gen.ts";
import {
	isChatInput,
	isCommand,
	isPing,
	stringToBoolean,
} from "./utils/mod.ts";

async function handler(request: Request): Promise<Response> {
	const requestUrl = new URL(request.url);
	const requiredHeaders = [
		"x-signature-timestamp",
		"x-signature-ed25519",
	];

	const invalidRequest = new Response("Invalid request.", {
		status: STATUS_CODE.Unauthorized,
	});

	if (
		request.method === "POST" &&
		requiredHeaders.every((header) => request.headers.has(header))
	) {
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
			const rest = new REST().setToken(
				Deno.env.get("DISCORD_TOKEN")!,
			);
			const interaction: APIInteraction = JSON.parse(body);

			if (isCommand(interaction)) {
				const command = await manifestGen.commands.find((command) =>
					command.data.name === interaction.data.name &&
					command.data.type === interaction.data.type
				);
				const opts = { rest, kv: await Deno.openKv() };

				if (command) {
					if (isChatInput(command)) {
						return await command.execute({
							interaction:
								interaction as APIChatInputApplicationCommandInteraction,
							...opts,
						});
					} else {
						console.log(interaction);
						return new Response(
							`Unknowm command type. (${interaction.data.type})`,
						);
					}
				} else {
					const err = `Command not found.`;

					console.log(err);
					return new Response(err);
				}
			} else if (isPing(interaction)) {
				const updateCommands = stringToBoolean(
					requestUrl.searchParams.get("updateCommands")!,
				);
				if (updateCommands) {
					await rest.put(
						Routes.applicationCommands(
							Deno.env.get("DISCORD_ID")!,
						),
						{
							body: manifestGen.commands.map((command) =>
								command.data
							),
						},
					);
				}

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
	} else {
		return invalidRequest;
	}
}

Deno.serve(handler);
