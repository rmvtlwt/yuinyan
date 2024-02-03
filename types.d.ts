import type {
	APIApplicationCommandInteraction,
	APIChatInputApplicationCommandInteraction,
	RESTPostAPIApplicationCommandsJSONBody,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord_api_types";

export interface ICommand<
	Data extends RESTPostAPIApplicationCommandsJSONBody,
	Interaction extends APIApplicationCommandInteraction,
> {
	data: Data;
	execute(interaction: Interaction): void | Promise<void>;
}

export type ChatInputCommand = ICommand<
	& Required<Pick<RESTPostAPIChatInputApplicationCommandsJSONBody, "type">>
	& RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIChatInputApplicationCommandInteraction
>;

export type Command = ChatInputCommand;
