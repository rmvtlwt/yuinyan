import type {
	APIApplicationCommandInteraction,
	APIChatInputApplicationCommandInteraction,
	APIInteraction,
	RESTPostAPIApplicationCommandsJSONBody,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	Snowflake,
} from "discord_api_types";
import type { API } from "@discordjs/core";

export interface ExecuteOptions<Interaction extends APIInteraction> {
	api: API;
	interaction: Interaction;
	kv: Deno.Kv;
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

export interface CustomRole {
	roleId: Snowflake;
	members: Snowflake[];
}
