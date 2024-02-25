import type { ChatInputCommand, Command } from "../types.d.ts";
import {
	type APIApplicationCommandInteractionDataAttachmentOption,
	type APIApplicationCommandInteractionDataBasicOption,
	type APIApplicationCommandInteractionDataStringOption,
	type APIApplicationCommandInteractionDataSubcommandGroupOption,
	type APIApplicationCommandInteractionDataSubcommandOption,
	type APIAttachment,
	type APIChatInputApplicationCommandInteraction,
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from "discord_api_types";

export function isChatInput(command: Command): command is ChatInputCommand {
	return command.data.type === ApplicationCommandType.ChatInput;
}

export function getSubcommandGroup(
	interaction: APIChatInputApplicationCommandInteraction,
	required: true,
): NonNullable<APIApplicationCommandInteractionDataSubcommandGroupOption>;
export function getSubcommandGroup(
	interaction: APIChatInputApplicationCommandInteraction,
	required?: boolean,
):
	| NonNullable<APIApplicationCommandInteractionDataSubcommandGroupOption>
	| null;
export function getSubcommandGroup(
	interaction: APIChatInputApplicationCommandInteraction,
	required = true,
):
	| NonNullable<APIApplicationCommandInteractionDataSubcommandGroupOption>
	| null {
	const hoistedOptions = interaction.data.options ?? [];
	const subcommandGroup = hoistedOptions.find((option) =>
		option.type === ApplicationCommandOptionType.SubcommandGroup
	) as APIApplicationCommandInteractionDataSubcommandGroupOption | undefined;
	if (!subcommandGroup && required) {
		throw new Error("This command doesn't have subcommand group");
	} else {
		return subcommandGroup ?? null;
	}
}

export function getSubcommand(
	interaction: APIChatInputApplicationCommandInteraction,
	required: true,
): NonNullable<APIApplicationCommandInteractionDataSubcommandOption>;
export function getSubcommand(
	interaction: APIChatInputApplicationCommandInteraction,
	required?: boolean,
): NonNullable<APIApplicationCommandInteractionDataSubcommandOption> | null;
export function getSubcommand(
	interaction: APIChatInputApplicationCommandInteraction,
	required = true,
): NonNullable<APIApplicationCommandInteractionDataSubcommandOption> | null {
	const hoistedOptions = getSubcommandGroup(interaction, false)?.options ??
		interaction.data.options ?? [];
	const subcommand = hoistedOptions.find((option) =>
		option.type === ApplicationCommandOptionType.Subcommand
	) as APIApplicationCommandInteractionDataSubcommandOption | undefined;
	if (!subcommand && required) {
		throw new Error("This command doesn't have subcommand");
	} else {
		return subcommand ?? null;
	}
}

export function getOption<
	T extends APIApplicationCommandInteractionDataBasicOption,
>(
	interaction: APIChatInputApplicationCommandInteraction,
	optionName: string,
	required: true,
): NonNullable<T>;
export function getOption<
	T extends APIApplicationCommandInteractionDataBasicOption,
>(
	interaction: APIChatInputApplicationCommandInteraction,
	optionName: string,
	required?: boolean,
): NonNullable<T> | null;
export function getOption<
	T extends APIApplicationCommandInteractionDataBasicOption,
>(
	interaction: APIChatInputApplicationCommandInteraction,
	optionName: string,
	required = false,
): NonNullable<T> | null {
	const hoistedOptions =
		getSubcommandGroup(interaction, false)?.options[0]?.options ??
			getSubcommand(interaction, false)?.options ??
			interaction.data.options ??
			[];
	const option = hoistedOptions?.find((option) => option.name === optionName);
	if (!option && required) {
		throw new Error(`Option not found: ${optionName}`);
	} else {
		return option as T | undefined ?? null;
	}
}

export function getAttachmentOption(
	interaction: APIChatInputApplicationCommandInteraction,
	optionName: string,
	required: true,
): APIAttachment;
export function getAttachmentOption(
	interaction: APIChatInputApplicationCommandInteraction,
	optionName: string,
	required?: boolean,
): APIAttachment | null;
export function getAttachmentOption(
	interaction: APIChatInputApplicationCommandInteraction,
	optionName: string,
	required = false,
): APIAttachment | null {
	const attachmentId = getOption<
		APIApplicationCommandInteractionDataAttachmentOption
	>(
		interaction,
		optionName,
		required,
	)?.value;

	return (interaction.data.resolved?.attachments ?? {})[attachmentId!] ??
		null;
}

export function getStringOption(
	interaction: APIChatInputApplicationCommandInteraction,
	optionName: string,
	required: true,
): string;
export function getStringOption(
	interaction: APIChatInputApplicationCommandInteraction,
	optionName: string,
	required?: boolean,
): string | null;
export function getStringOption(
	interaction: APIChatInputApplicationCommandInteraction,
	optionName: string,
	required = false,
): string | null {
	return getOption<APIApplicationCommandInteractionDataStringOption>(
		interaction,
		optionName,
		required,
	)?.value ?? null;
}
