import type {
	APIApplicationCommandInteraction,
	APIChatInputApplicationCommandInteraction,
	APIInteraction,
	RESTPostAPIApplicationCommandsJSONBody,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord_api_types";
import { REST } from "@discordjs/rest";

export interface ExecuteOptions<Interaction extends APIInteraction> {
	rest: REST;
	interaction: Interaction;
}

export interface ICommand<
	Data extends RESTPostAPIApplicationCommandsJSONBody,
	Interaction extends APIApplicationCommandInteraction,
> {
	data: Data;
	execute(options: ExecuteOptions<Interaction>): Response | Promise<Response>;
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
