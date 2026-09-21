import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { levelingService } from '../services/levelingService.js';

export const levelingCommands = [
  {
    data: new SlashCommandBuilder().setName('rank').setDescription('Show your XP rank.').addUserOption(o => o.setName('user').setDescription('User to view')),
    async execute(interaction: any) {
      const user = interaction.options.getUser('user') ?? interaction.user;
      const stats = await levelingService.getStats(interaction.guildId, user.id);
      const rank = await levelingService.getRank(interaction.guildId, stats.xp);
      const next = levelingService.xpForLevel(stats.level + 1);
      const embed = new EmbedBuilder().setTitle(`${user.username}'s rank`).setThumbnail(user.displayAvatarURL()).addFields(
        { name: 'Level', value: String(stats.level), inline: true },
        { name: 'XP', value: `${stats.xp}/${next}`, inline: true },
        { name: 'Server rank', value: `#${rank}`, inline: true },
      ).setColor(0x5865f2);
      await interaction.reply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder().setName('leaderboard').setDescription('Show the server XP leaderboard.'),
    async execute(interaction: any) {
      const entries = await levelingService.leaderboard(interaction.guildId, 10);
      const description = entries.length ? entries.map((entry, index) => `**${index + 1}.** <@${entry.userId}> — Level ${entry.level} (${entry.xp} XP)`).join('\n') : 'No XP has been earned yet.';
      await interaction.reply({ embeds: [new EmbedBuilder().setTitle('XP leaderboard').setDescription(description).setColor(0xf1c40f)] });
    },
  },
];
