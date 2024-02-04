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
	execute(interaction: Interaction): Response | Promise<Response>;
}

export type ChatInputCommand = ICommand<
	& Required<Pick<RESTPostAPIChatInputApplicationCommandsJSONBody, "type">>
	& RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIChatInputApplicationCommandInteraction
>;

export type Command = ChatInputCommand;

export interface Manifest {
	commands: Command[];
}
