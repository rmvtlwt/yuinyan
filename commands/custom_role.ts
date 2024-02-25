import {
	type APIApplicationCommandInteractionDataSubcommandOption,
	type APIChatInputApplicationCommandInteraction,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	GuildFeature,
	InteractionResponseType,
	MessageFlags,
} from "discord_api_types";
import type {
	ChatInputCommand,
	CustomRole,
	ExecuteOptions,
} from "../types.d.ts";

import config from "../config.json" with { type: "json" };

import {
	getAttachmentOption,
	getStringOption,
	translate,
} from "../utils/mod.ts";
import { encodeBase64 } from "std/encoding/base64.ts";

export default {
	data: {
		name: "custom-role",
		description: "Manage peran kustom mu :3",
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: "claim",
				description: "🎐 · Klaim custom role Kamuu :3",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: "name",
						description: "🎐 · Atur nama custom role kamu :3",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
					{
						name: "color",
						description:
							"🎐 · Atur warna custom role kamu :3 (contoh: #CE92FF)",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
					{
						name: "icon",
						description: "🎐 · Atur icon role kamu :3",
						type: ApplicationCommandOptionType.Attachment,
						required: false,
					},
				],
			},
			{
				name: "update",
				description: "🎐 · Update custom role kamu",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: "name",
						description: "🎐 · Atur nama custom role kamu :3",
						type: ApplicationCommandOptionType.String,
						required: false,
					},
					{
						name: "color",
						description:
							"🎐 · Atur warna custom role kamu :3 (contoh: #CE92FF)",
						type: ApplicationCommandOptionType.String,
						required: false,
					},
					{
						name: "icon",
						description: "🎐 · Atur icon role kamu :3",
						type: ApplicationCommandOptionType.Attachment,
						required: false,
					},
				],
			},
		],
		dm_permission: false,
	},
	execute(options) {
		const subcommand = options.interaction.data.options?.find((option) =>
			option.type === ApplicationCommandOptionType.Subcommand
		)! as APIApplicationCommandInteractionDataSubcommandOption;

		// TODO(@aureziaa): create edit custom role function
		let action;
		switch (subcommand.name) {
			case "claim": {
				action = claimCustomRole;
				break;
			}
			case "update": {
				action = updateCustomRole;
				break;
			}
			default: {
				throw new Error(`Unknown subcommand: ${subcommand.name}`);
			}
		}

		action({ ...options });
		return Response.json({
			type: InteractionResponseType
				.DeferredChannelMessageWithSource,
		});
	},
} as ChatInputCommand;

async function claimCustomRole(
	{
		api,
		interaction,
		kv,
	}: ExecuteOptions<APIChatInputApplicationCommandInteraction>,
): Promise<void> {
	const kvKey: Deno.KvKey = [
		"custom_role",
		interaction.guild_id!,
		interaction.member!.user.id,
	];
	const customRoleData = await kv.get<CustomRole>(kvKey);

	if (customRoleData.value) {
		return void await api.interactions.editReply(
			interaction.application_id,
			interaction.token,
			{
				embeds: [{
					color: config.color,
					description: translate("custom_role_already_claimed"),
				}],
			},
		);
	} else {
		const name = getStringOption(interaction, "name", true);
		const color = getStringOption(interaction, "color", true);
		const icon = getAttachmentOption(interaction, "icon") ?? undefined;

		const guild = await api.guilds.get(interaction.guild_id!);

		const isEligible = guild.features.includes(
			GuildFeature.RoleIcons,
		);

		if (!RegExp(/^#[a-f0-9]{6}$/gi).test(color)) {
			return void await api.interactions.editReply(
				interaction.application_id,
				interaction.token,
				{
					embeds: [{
						color: config.color,
						description: translate(
							"custom_role_creation_invalid_color",
							{
								link: "https://imagecolorpicker.com/en",
							},
						),
					}],
					flags: MessageFlags.Ephemeral,
				},
			);
		} else {
			let iconData;

			if (icon) {
				if (isEligible) {
					if (
						RegExp(/^image\/(png|jpg|jpeg)$/).test(
							icon.content_type!,
						)
					) {
						return void await api.interactions.editReply(
							interaction.application_id,
							interaction.token,
							{
								content: translate(
									"custom_role_creation_invalid_icon",
								),
							},
						);
					} else {
						iconData = await fetch(icon.url).then((
							response,
						) => response.arrayBuffer());
					}
				} else {
					return void await api.interactions.editReply(
						interaction.application_id,
						interaction.token,
						{
							content: translate("custom_role_icon_not_eligible"),
						},
					);
				}
			}

			try {
				const newRole = await api.guilds.createRole(
					interaction.guild_id!,
					{
						name,
						color: Number(color.replace("#", "0x")),
						icon: iconData
							? `data:${icon?.content_type};base64,${
								encodeBase64(iconData!)
							}`
							: undefined,
					},
				);

				const guildRoles = await api.guilds.getRoles(
					interaction.guild_id!,
				);

				await api.guilds.setRolePositions(interaction.guild_id!, [{
					id: newRole.id,
					position: guildRoles.find((role) =>
						role.id ===
							"1196032785970888765"
					)!.position,
				}]);

				await api.guilds.addRoleToMember(
					interaction.guild_id!,
					interaction.member!.user.id,
					newRole.id,
				);

				await kv.atomic().set(
					kvKey,
					{ roleId: newRole.id } as CustomRole,
				).commit();

				await api.interactions.editReply(
					interaction.application_id,
					interaction.token,
					{
						embeds: [{
							color: config.color,
							description: translate(
								"custom_role_creation_success",
								{
									emoji: Deno.env.get(
										"DISCORD_EMOJI_SUCCESS",
									),
									role: `<@&${newRole.id}>`,
								},
							),
						}],
					},
				);
			} catch (_error) {
				await api.interactions.editReply(
					interaction.application_id,
					interaction.token,
					{
						embeds: [{
							color: config.color,
							description: translate("error"),
						}],
					},
				);
			}
		}
	}
}

async function updateCustomRole(
	{
		api,
		interaction,
		kv,
	}: ExecuteOptions<APIChatInputApplicationCommandInteraction>,
): Promise<void> {
	const kvKey: Deno.KvKey = [
		"custom_role",
		interaction.guild_id!,
		interaction.member!.user.id,
	];
	const customRoleData = await kv.get<CustomRole>(kvKey);

	if (!customRoleData.value) {
		return void await api.interactions.editReply(
			interaction.application_id,
			interaction.token,
			{
				embeds: [{
					color: config.color,
					description: translate("custom_role_not_claimed"),
				}],
			},
		);
	} else {
		const name = getStringOption(interaction, "name") ?? undefined;
		const color = getStringOption(interaction, "color") ?? undefined;
		const icon = getAttachmentOption(interaction, "icon") ?? undefined;

		if (!name && !color && !icon) {
			return void await api.interactions.editReply(
				interaction.application_id,
				interaction.token,
				{
					embeds: [{
						color: config.color,
						description: translate(
							"custom_role_update_no_changes",
							{
								emoji: Deno.env.get("DISCORD_EMOJI_CONFUSED"),
							},
						),
					}],
				},
			);
		}

		const guild = await api.guilds.get(interaction.guild_id!);

		const isEligible = guild.features.includes(
			GuildFeature.RoleIcons,
		);

		if (color && !RegExp(/^#[a-f0-9]{6}$/gi).test(color)) {
			return void await api.interactions.editReply(
				interaction.application_id,
				interaction.token,
				{
					embeds: [{
						color: config.color,
						description: translate(
							"custom_role_creation_invalid_color",
							{
								link: "https://imagecolorpicker.com/en",
							},
						),
					}],
					flags: MessageFlags.Ephemeral,
				},
			);
		} else {
			let iconData;

			if (icon) {
				if (isEligible) {
					if (
						RegExp(/^image\/(png|jpg|jpeg)$/).test(
							icon.content_type!,
						)
					) {
						return void await api.interactions.editReply(
							interaction.application_id,
							interaction.token,
							{
								content: translate(
									"custom_role_creation_invalid_icon",
								),
							},
						);
					} else {
						iconData = await fetch(icon.url).then((
							response,
						) => response.arrayBuffer());
					}
				} else {
					return void await api.interactions.editReply(
						interaction.application_id,
						interaction.token,
						{
							content: translate("custom_role_icon_not_eligible"),
						},
					);
				}
			}

			try {
				await api.guilds.editRole(
					interaction.guild_id!,
					customRoleData.value.roleId,
					{
						name,
						color: color
							? Number(color.replace("#", "0x"))
							: undefined,
						icon: iconData
							? `data:${icon?.content_type};base64,${
								encodeBase64(iconData!)
							}`
							: undefined,
					},
				);

				await api.interactions.editReply(
					interaction.application_id,
					interaction.token,
					{
						embeds: [{
							color: config.color,
							description: translate(
								"custom_role_update_success",
								{
									emoji: Deno.env.get(
										"DISCORD_EMOJI_SUCCESS",
									),
								},
							),
						}],
					},
				);
			} catch (_error) {
				await api.interactions.editReply(
					interaction.application_id,
					interaction.token,
					{
						embeds: [{
							color: config.color,
							description: translate("error"),
						}],
					},
				);
			}
		}
	}
}
