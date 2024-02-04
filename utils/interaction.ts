import {
	type APIApplicationCommandInteraction,
	type APIInteraction,
	type APIPingInteraction,
	InteractionType,
} from "discord_api_types";

export function isCommand(
	interaction: APIInteraction,
): interaction is APIApplicationCommandInteraction {
	return interaction.type === InteractionType.ApplicationCommand;
}

export function isPing(
	interaction: APIInteraction,
): interaction is APIPingInteraction {
	return interaction.type === InteractionType.Ping;
}
