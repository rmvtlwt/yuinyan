import type {
	APIApplicationCommandInteraction,
	APIChatInputApplicationCommandInteraction,
	APIInteractionResponse,
	APIInteractionResponseChannelMessageWithSource,
	APIInteractionResponseDeferredChannelMessageWithSource,
	APIModalInteractionResponse,
	RESTPostAPIApplicationCommandsJSONBody,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord_api_types";

export interface ICommand<
	Data extends RESTPostAPIApplicationCommandsJSONBody,
	Interaction extends APIApplicationCommandInteraction,
	ResponseType extends APIInteractionResponse,
> {
	data: Data;
	execute(interaction: Interaction): ResponseType | Promise<ResponseType>;
}

export type ChatInputCommand = ICommand<
	& Required<Pick<RESTPostAPIChatInputApplicationCommandsJSONBody, "type">>
	& RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIChatInputApplicationCommandInteraction,
	(
		| APIInteractionResponseChannelMessageWithSource
		| APIInteractionResponseDeferredChannelMessageWithSource
		| APIModalInteractionResponse
	)
>;

export type Command = ChatInputCommand;
