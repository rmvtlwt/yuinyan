import type { ChatInputCommand, Command } from "../types.d.ts";
import { ApplicationCommandType } from "discord_api_types";

export function isChatInput(command: Command): command is ChatInputCommand {
	return command.data.type === ApplicationCommandType.ChatInput;
}
