const commandFiles = [];

for await (const file of Deno.readDir("./commands")) {
	commandFiles.push(`./commands/${file.name}`);
}

const output = `
${
	commandFiles.map((context, index) => `import $${index} from "${context}"`)
		.join("\n")
}

export default {
    commands: [
        ${commandFiles.map((_context, index) => `$${index}`)}
    ]
};`;

const proc = new Deno.Command(Deno.execPath(), {
	args: ["fmt", "-"],
	stdin: "piped",
	stdout: "piped",
	stderr: "null",
}).spawn();

const raw = new ReadableStream({
	type: "bytes",
	start(cont) {
		cont.enqueue(new TextEncoder().encode(output));
		cont.close();
	},
});

await raw.pipeTo(proc.stdin);
const { stdout } = await proc.output();

await Deno.writeTextFile("manifest.gen.ts", new TextDecoder().decode(stdout));
