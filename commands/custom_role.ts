import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	InteractionResponseType,
} from "discord_api_types";
import type { ChatInputCommand } from "../types.d.ts";

export default {
	data: {
		name: "custom-role",
		description: "Manage peran kustom mu :3",
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: "create",
				description: "Buat peran kustom mu :3",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: "name",
						description: "Atur nama peran kustom mu :3",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
					{
						name: "color",
						description:
							"Atur warna kustom role kamu :3 (contoh: #CE92FF)",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
					{
						name: "icon",
						description: "Atur icon peran kamu :3",
						type: ApplicationCommandOptionType.Attachment,
						required: false,
					},
				],
			},
		],
	},
	execute({ interaction }) {
		const subcommand = interaction.data.options
		return Response.json({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: { content: "Coming zoon.. 🐊" },
		});
	},
} as ChatInputCommand;
