import {
	type APIApplicationCommandInteractionDataAttachmentOption,
	type APIApplicationCommandInteractionDataStringOption,
	type APIApplicationCommandInteractionDataSubcommandOption,
	type APIChatInputApplicationCommandInteraction,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	GuildFeature,
	InteractionResponseType,
	MessageFlags,
	type RESTGetAPIGuildResult,
	type RESTGetAPIGuildRolesResult,
	type RESTPatchAPIGuildRolePositionsJSONBody,
	type RESTPatchAPIInteractionOriginalResponseJSONBody,
	type RESTPostAPIGuildRoleJSONBody,
	type RESTPostAPIGuildRoleResult,
	Routes,
} from "discord_api_types";
import type {
	ChatInputCommand,
	CustomRole,
	ExecuteOptions,
} from "../types.d.ts";

import { encodeBase64 } from "std/encoding/base64.ts";

export default {
	data: {
		name: "custom-role",
		description: "Manage peran kustom mu :3",
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: "claim",
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
		dm_permission: false,
	},
	execute(options) {
		const subcommand = options.interaction.data.options?.find((option) =>
			option.type === ApplicationCommandOptionType.Subcommand
		)! as APIApplicationCommandInteractionDataSubcommandOption;
		const kvKey: Deno.KvKey = [
			"custom_role",
			options.interaction.member!.user.id,
		];

		// TODO(@aureziaa): create edit custom role function
		switch (subcommand.name) {
			case "create": {
				createCustomRole({ ...options, kvKey, subcommand });
				return Response.json({
					type: InteractionResponseType
						.DeferredChannelMessageWithSource,
				});
			}
		}
	},
} as ChatInputCommand;

async function createCustomRole(
	{
		interaction,
		rest,
		kv,
		kvKey,
		subcommand,
	}: ExecuteOptions<APIChatInputApplicationCommandInteraction> & {
		kvKey: Deno.KvKey;
		subcommand: APIApplicationCommandInteractionDataSubcommandOption;
	},
): Promise<void> {
	const customRoleData = await kv.get<CustomRole>(kvKey);
	const patchRoute = Routes.webhookMessage(
		interaction.application_id,
		interaction.token,
		"@original",
	);

	if (customRoleData.value) {
		return void await rest.patch(patchRoute, {
			body: {
				content:
					`Kamu udah punya custom role maniez. Kalau ada yang mau diubah, pake \`/custom-role edit\` ya!! Tengkyew`,
			},
		});
	} else {
		const [name, color, iconId] = (subcommand
			.options! as (
				| APIApplicationCommandInteractionDataStringOption
				| APIApplicationCommandInteractionDataAttachmentOption
			)[]).map((option) => option.value);

		const icon = iconId
			? (interaction.data.resolved?.attachments!)[iconId]
			: undefined;

		const guild = await rest.get(
			Routes.guild(interaction.guild_id!),
		) as RESTGetAPIGuildResult;

		const isEligible = guild.features.includes(
			GuildFeature.RoleIcons,
		);

		if (!RegExp(/^#[a-f0-9]{6}$/gi).test(color)) {
			return void await rest.patch(patchRoute, {
				body: {
					content:
						`🎐 - Format warna role nya ga valid nih. Coba pilih warna kamu [disini](<https://imagecolorpicker.com/en>)`,
					flags: MessageFlags.Ephemeral,
				},
			});
		} else {
			let iconData;

			if (icon) {
				if (
					RegExp(/^image\/(png|jpg|jpeg)$/).test(
						icon.content_type!,
					)
				) {
					return void await rest.patch(patchRoute, {
						body: {
							content:
								`Format file nya salah nih kak.. iconnya harus file \`png\`, \`jpg\` atau \`jpeg\` aja kak, cari file lain yaa.. hehe`,
						},
					});
				} else {
					iconData = await fetch(icon.url).then((
						response,
					) => response.arrayBuffer());
				}
			}

			try {
				const newRole = await rest.post(
					Routes.guildRoles(interaction.guild_id!),
					{
						body: {
							name,
							color: Number(color.replace("#", "0x")),
							icon: isEligible
								? `data:${icon?.content_type};base64,${
									encodeBase64(iconData!)
								}`
								: undefined,
						} as RESTPostAPIGuildRoleJSONBody,
					},
				) as RESTPostAPIGuildRoleResult;

				const guildRoles = await rest.get(
					Routes.guildRoles(interaction.guild_id!),
				) as RESTGetAPIGuildRolesResult;

				await rest.patch(
					Routes.guildRoles(
						interaction.guild_id!,
					),
					{
						body: [{
							id: newRole.id,
							position: guildRoles.find((role) =>
								role.id ===
									"1196032785970888765"
							)!.position,
						}] as RESTPatchAPIGuildRolePositionsJSONBody,
					},
				);

				await kv.atomic().set(
					kvKey,
					{ roleId: newRole.id } as CustomRole,
				).commit();

				await rest.put(
					Routes.guildMemberRole(
						interaction.guild_id!,
						interaction.member!.user.id,
						newRole.id,
					),
				);

				await rest.patch(patchRoute, {
					body: {
						content:
							`Selamat, role kamu berhasil di claim!! <@&${newRole.id}>`,
					} as RESTPatchAPIInteractionOriginalResponseJSONBody,
				});
			} catch (_error) {
				await rest.patch(patchRoute, {
					body: {
						content:
							`Umm.. kayaknya ada yang salah deh, silahkan DM developer untuk melaporkan masalah ini, trimakasii ^^`,
					} as RESTPatchAPIInteractionOriginalResponseJSONBody,
				});
			}
		}
	}
}
