import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export const utilityCommands = [
  {
    data: new SlashCommandBuilder().setName('ping').setDescription('Show bot and API latency.'),
    async execute(interaction: any) {
      await interaction.reply({ content: `Pong! API latency: ${interaction.client.ws.ping}ms.`, ephemeral: true });
    },
  },
  {
    data: new SlashCommandBuilder().setName('serverinfo').setDescription('Show information about this server.'),
    async execute(interaction: any) {
      const guild = interaction.guild;
      const embed = new EmbedBuilder().setTitle(guild.name).setThumbnail(guild.iconURL()).addFields(
        { name: 'Members', value: String(guild.memberCount), inline: true },
        { name: 'Channels', value: String(guild.channels.cache.size), inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
      ).setColor(0x5865f2);
      await interaction.reply({ embeds: [embed] });
    },
  },
];
