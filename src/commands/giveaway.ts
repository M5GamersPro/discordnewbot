import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';

export const giveawayCommand = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Create a giveaway.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('prize').setDescription('Prize').setRequired(true))
    .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setRequired(true).setMinValue(1).setMaxValue(20))
    .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes').setRequired(true).setMinValue(1).setMaxValue(10080)),
  async execute(interaction: any) {
    const prize = interaction.options.getString('prize');
    const winners = interaction.options.getInteger('winners');
    const minutes = interaction.options.getInteger('minutes');
    const embed = new EmbedBuilder().setTitle('🎉 Giveaway').setDescription(`**Prize:** ${prize}\n**Winners:** ${winners}\n**Ends:** <t:${Math.floor((Date.now() + minutes * 60_000) / 1000)}:F>`).setColor(0xfaa61a);
    const sent = await interaction.channel.send({ embeds: [embed] });
    await sent.react('🎉');
    await prisma.giveaway.create({
      data: {
        guildId: interaction.guildId,
        channelId: sent.channel.id,
        messageId: sent.id,
        prize,
        winners,
        endsAt: new Date(Date.now() + minutes * 60_000),
      },
    });
    await interaction.reply({ content: 'Giveaway created.', ephemeral: true });
  },
};
