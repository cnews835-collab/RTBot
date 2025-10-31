const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const OWNER_ID = "1338789690068701204"; // Replace with your Discord ID

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Ticket Panel Command
client.on("messageCreate", async message => {
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

  // About Us Command
  if (message.content === "!about") {
    const embed = new EmbedBuilder()
      .setTitle("📖 About Us")
      .setDescription("Welcome to Realistic Technologies (RT Industries)! ⚡\n\nWe’re a creative hub for Roblox developers, creators, and clients. Our mission is to deliver high-quality assets, custom games, and innovative solutions tailored to your vision.\n\nFounded by BlixtDev, RT Industries is built on:\n- **Imagination**\n- **Precision**\n- **Trust**")
      .setColor(0xFFD700);
    await message.channel.send({ embeds: [embed] });
  }

  // Announcement Command
  if (message.content.startsWith("!announce") && message.author.id === OWNER_ID) {
    const announcement = message.content.replace("!announce", "").trim();
    if (announcement.length > 0) {
      await message.channel.send(`📢 **Announcement:** ${announcement}`);
    } else {
      message.reply("Please include your announcement text.");
    }
  }

  // Add Member to Ticket
  if (message.content.startsWith("!add") && message.author.id === OWNER_ID) {
    const mentioned = message.mentions.users.first();
    if (!mentioned) return message.reply("Please mention a user to add.");

    const channel = message.channel;
    await channel.permissionOverwrites.edit(mentioned.id, {
      ViewChannel: true,
      SendMessages: true
    });

    message.reply(`✅ Added ${mentioned.username} to this ticket.`);
  }
});

// Ticket Button Handler
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  const ticketType = {
    custom_order: "🎮 Custom Order Ticket",
    support: "🛠️ Support Ticket",
    market: "📢 Market Inquiry Ticket"
  };

  const channel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: 0, // Text channel
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

  await channel.send(`Hello ${interaction.user}, this is your ${ticketType[interaction.customId]}.\nPlease describe your issue or request.`);
  await interaction.reply({ content: "✅ Ticket created!", ephemeral: true });
});

client.login(process.env.BOT_TOKEN); // Use Railway environment variable
