import {
	type APIInteraction,
	type APIPingInteraction,
	InteractionType,
} from "discord_api_types";

export function isPingInteraction(
	interaction: APIInteraction,
): interaction is APIPingInteraction {
	return interaction.type == InteractionType.Ping;
}
