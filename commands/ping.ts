import {
	ApplicationCommandType,
	InteractionResponseType,
} from "discord_api_types";
import type { ChatInputCommand } from "../types.d.ts";

export default {
	data: {
		name: "ping",
		description: "Ngetes aja banh 🐊",
		type: ApplicationCommandType.ChatInput,
	},
	execute(_options) {
		return Response.json({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: { content: "Nggih 🐊" },
		});
	},
} as ChatInputCommand;
