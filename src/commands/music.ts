import { SlashCommandBuilder } from 'discord.js';
import { musicService } from '../services/musicService.js';

export const musicCommand = {
  data: new SlashCommandBuilder().setName('music').setDescription('Music controls.')
    .addSubcommand(s => s.setName('play').setDescription('Play a search or URL.').addStringOption(o => o.setName('query').setDescription('Song or URL').setRequired(true)))
    .addSubcommand(s => s.setName('skip').setDescription('Skip the current track.'))
    .addSubcommand(s => s.setName('pause').setDescription('Pause playback.'))
    .addSubcommand(s => s.setName('resume').setDescription('Resume playback.'))
    .addSubcommand(s => s.setName('queue').setDescription('Show the queue.'))
    .addSubcommand(s => s.setName('stop').setDescription('Stop music and leave voice.')),
  async execute(interaction: any) {
    try {
      const sub = interaction.options.getSubcommand();
      if (sub === 'play') {
        const result = await musicService.play(interaction.member, interaction.options.getString('query'));
        return interaction.reply(`Queued **${result.track.title}**${result.position > 0 ? ` at position ${result.position}` : ''}.`);
      }
      if (sub === 'skip') return interaction.reply(musicService.skip(interaction.guildId) ? 'Skipped.' : 'Nothing is playing.');
      if (sub === 'pause') return interaction.reply(musicService.pause(interaction.guildId) ? 'Paused.' : 'Nothing is playing.');
      if (sub === 'resume') return interaction.reply(musicService.resume(interaction.guildId) ? 'Resumed.' : 'Nothing is paused.');
      if (sub === 'stop') return interaction.reply(musicService.stop(interaction.guildId) ? 'Stopped and left the voice channel.' : 'Nothing is playing.');
      const queue = musicService.queue(interaction.guildId);
      return interaction.reply(queue.current ? `Now playing: **${queue.current.title}**\n${queue.queue.map((track, i) => `${i + 1}. ${track.title}`).join('\n') || 'Queue is empty.'}` : 'Nothing is playing.');
    } catch (error) {
      return interaction.reply({ content: error instanceof Error ? error.message : 'Music could not start.', ephemeral: true });
    }
  },
};
