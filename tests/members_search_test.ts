import { REST } from "@discordjs/rest";

const rest = new REST().setToken(Deno.env.get("DISCORD_TOKEN")!);

const guildId = "950726336836689930";
const membersSearch = await rest.post(`/guilds/${guildId}/members-search`);

console.log(membersSearch);
