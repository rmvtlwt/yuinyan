import type {
	APIApplicationCommandInteraction,
	APIChatInputApplicationCommandInteraction,
	RESTPostAPIApplicationCommandsJSONBody,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord_api_types";

export interface Command<
	Data extends RESTPostAPIApplicationCommandsJSONBody,
	Interaction extends APIApplicationCommandInteraction,
> {
	data: Data;
	execute(interaction: Interaction): void | Promise<void>;
}

export type ChatInputCommand = Command<
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIChatInputApplicationCommandInteraction
>;
