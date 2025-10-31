const { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const OWNER_ID = "1338789690068701204";
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = "1433753492333269033";
const GUILD_ID = "1433733031318913067";

// Slash Command Registration
const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Check bot latency"),
  new SlashCommandBuilder().setName("about").setDescription("Learn about RT Industries"),
  new SlashCommandBuilder().setName("release").setDescription("Announce a product release")
    .addStringOption(opt => opt.setName("title").setDescription("Product title").setRequired(true))
    .addStringOption(opt => opt.setName("description").setDescription("Product description").setRequired(true))
    .addStringOption(opt => opt.setName("image").setDescription("Image URL").setRequired(true)),
  new SlashCommandBuilder().setName("ticket").setDescription("Open the ticket panel"),
  new SlashCommandBuilder().setName("close").setDescription("Close this ticket"),
];

const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log("✅ Slash commands registered");
  } catch (err) {
    console.error("❌ Failed to register commands", err);
  }
})();

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Slash Commands
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    await interaction.reply(`🏓 Pong! Latency: ${client.ws.ping}ms`);
  }

  if (commandName === "about") {
    const embed = new EmbedBuilder()
      .setTitle("📖 About RT Industries")
      .setDescription("We build high-quality Roblox assets and experiences. Founded by BlixtDev.")
      .setColor(0xFFD700);
    await interaction.reply({ embeds: [embed] });
  }

  if (commandName === "release") {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const image = interaction.options.getString("image");
    const embed = new EmbedBuilder()
      .setTitle(`🚀 New Release: ${title}`)
      .setDescription(description)
      .setImage(image)
      .setColor(0x00FF99);
    await interaction.reply({ embeds: [embed] });
  }

  if (commandName === "ticket") {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket Panel")
      .setDescription("Choose your ticket type:")
      .setColor(0x00AEFF);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("custom_order").setLabel("🎮 Custom Order").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("support").setLabel("🛠️ Support").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("market").setLabel("📢 Market Inquiry").setStyle(ButtonStyle.Success)
    );
    await interaction.reply({ embeds: [embed], components: [row] });
  }

  if (commandName === "close") {
    const channel = interaction.channel;
    await channel.send("🔒 Ticket closed. Deleting in 5 seconds...");
    setTimeout(() => channel.delete().catch(() => {}), 5000);
  }
});

// Ticket Button Handler
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  const ticketType = {
    custom_order: {
      name: "🎮 Custom Order Ticket",
      message: "What do you want to order? Our owner will reach out soon."
    },
    support: {
      name: "🛠️ Support Ticket",
      message: "Please describe your issue. Our support team will assist you shortly."
    },
    market: {
      name: "📢 Market Inquiry Ticket",
      message: "Tell us what you're interested in. We'll get back to you with options."
    }
  };

  const config = ticketType[interaction.customId];
  if (!config) return;

  const channel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: 0,
    permissionOverwrites: [
      {
        id: interaction.guild.roles.everyone,
        deny: ["ViewChannel"]
      },
      {
        id: interaction.user.id,
        allow: ["ViewChannel", "SendMessages"]
      },
      {
        id: OWNER_ID,
        allow: ["ViewChannel", "SendMessages"]
      }
    ]
  });

  await channel.send(`Hello ${interaction.user}, this is your ${config.name}.\n${config.message}`);
  await interaction.reply({ content: "✅ Ticket created!", ephemeral: true });
});

// Legacy !commands
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  if (message.content === "!panel" && message.author.id === OWNER_ID) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Assistance Panel")
      .setDescription("Choose the type of ticket you want to open:")
      .setColor(0x00AEFF);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("custom_order").setLabel("🎮 Custom Order").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("support").setLabel("🛠️ Support").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("market").setLabel("📢 Market Inquiry").setStyle(ButtonStyle.Success)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }

  if (message.content === "!close") {
    const channel = message.channel;
    const perms = channel.permissionOverwrites.cache;
    const opener = perms.find(p => p.allow.has(PermissionsBitField.Flags.ViewChannel) && p.id !== OWNER_ID && p.id !== channel.guild.roles.everyone.id);
    if (message.author.id === OWNER_ID || (opener && message.author.id === opener.id)) {
      await channel.send("🔒 Ticket closed. This channel will be deleted in 5 seconds.");
      setTimeout(() => channel.delete().catch(() => {}), 5000);
    } else {
      message.reply("❌ You don’t have permission to close this ticket.");
    }
  }
});

client.login(TOKEN);
