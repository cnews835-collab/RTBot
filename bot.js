const { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const OWNER_ID = "1338789690068701204";
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = "1433753492333269033";
const GUILD_ID = "1433733031318913067";

// Register Slash Commands
const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Check bot latency"),
  new SlashCommandBuilder().setName("about").setDescription("Learn about RT Industries"),
  new SlashCommandBuilder().setName("release").setDescription("Announce a product release")
    .addStringOption(opt => opt.setName("title").setDescription("Product title").setRequired(true))
    .addStringOption(opt => opt.setName("description").setDescription("Product description").setRequired(true))
    .addStringOption(opt => opt.setName("image").setDescription("Image URL").setRequired(true)),
  new SlashCommandBuilder().setName("feature").setDescription("Feature a product")
    .addStringOption(opt => opt.setName("title").setDescription("Product title").setRequired(true))
    .addStringOption(opt => opt.setName("description").setDescription("Product description").setRequired(true))
    .addStringOption(opt => opt.setName("image").setDescription("Image URL").setRequired(true)),
  new SlashCommandBuilder().setName("ticket").setDescription("Open the ticket panel"),
  new SlashCommandBuilder().setName("close").setDescription("Close this ticket"),
  new SlashCommandBuilder().setName("userinfo").setDescription("Get info about a user")
    .addUserOption(opt => opt.setName("target").setDescription("User").setRequired(true)),
  new SlashCommandBuilder().setName("announce").setDescription("Send an announcement")
    .addStringOption(opt => opt.setName("text").setDescription("Announcement text").setRequired(true)),
  new SlashCommandBuilder().setName("add").setDescription("Add a user to this ticket")
    .addUserOption(opt => opt.setName("user").setDescription("User to add").setRequired(true))
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

// Bot Ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Slash Command Handler
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

  if (commandName === "feature") {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const image = interaction.options.getString("image");
    const embed = new EmbedBuilder()
      .setTitle(`🌟 Featured Product: ${title}`)
      .setDescription(description)
      .setImage(image)
      .setColor(0xFFD700);
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

  if (commandName === "userinfo") {
    const user = interaction.options.getUser("target");
    const embed = new EmbedBuilder()
      .setTitle(`👤 User Info: ${user.username}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "ID", value: user.id },
        { name: "Tag", value: user.tag }
      )
      .setColor(0x3399FF);
    await interaction.reply({ embeds: [embed] });
  }

  if (commandName === "announce" && interaction.user.id === OWNER_ID) {
    const text = interaction.options.getString("text");
    await interaction.reply(`📢 Announcement: ${text}`);
  }

  if (commandName === "add" && interaction.user.id === OWNER_ID) {
    const user = interaction.options.getUser("user");
    await interaction.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true
    });
    await interaction.reply(`✅ Added ${user.username} to this ticket.`);
  }
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

  if (message.content === "!about") {
    const embed = new EmbedBuilder()
      .setTitle("📖 About Us")
      .setDescription("Welcome to RT Industries! ⚡ Founded by BlixtDev.")
      .setColor(0xFFD700);
    await message.channel.send({ embeds: [embed] });
  }

  if (message.content.startsWith("!announce") && message.author.id === OWNER_ID) {
    const announcement = message.content.replace("!announce", "").trim();
    if (announcement.length > 0) {
      await message.channel.send(`📢 **Announcement:** ${announcement}`);
    } else {
      message.reply("Please include your announcement text.");
    }
  }

  if (message.content.startsWith("!add") && message.author.id === OWNER_ID) {
    const mentioned = message.mentions.users.first();
    if (!mentioned) return message.reply("Please mention a user to add.");
    await message.channel.permissionOverwrites.edit(mentioned.id, {
      ViewChannel: true,
      SendMessages: true
    });
    message.reply(`✅ Added ${mentioned.username} to this ticket.`);
  }

  if (message.content === "!close") {
    const channel = message.channel;
    const perms = channel.permissionOverwrites.cache;
    const opener = perms.find(p => p.allow.has(PermissionsBitField.Flags.ViewChannel) && p.id !== OWNER_ID && p.id !== channel.guild.roles.everyone.id);
    if (message.author.id === OWNER_ID || (opener && message.author.id === opener
