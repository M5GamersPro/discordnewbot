import { AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, NoSubscriberBehavior, StreamType, VoiceConnection, AudioPlayer } from '@discordjs/voice';
import { GuildMember, VoiceChannel } from 'discord.js';
import play from 'play-dl';

type Track = { title: string; url: string; requestedBy: string };
type GuildPlayer = { connection: VoiceConnection; player: AudioPlayer; queue: Track[]; current?: Track };
const players = new Map<string, GuildPlayer>();

async function resolveTrack(query: string, requestedBy: string): Promise<Track> {
  if (/^https?:\/\//i.test(query)) return { title: query, url: query, requestedBy };
  const results = await play.search(query, { limit: 1 });
  if (!results[0]?.url) throw new Error('No results found.');
  return { title: results[0].title ?? results[0].url, url: results[0].url, requestedBy };
}

async function playNext(guildId: string) {
  const state = players.get(guildId);
  const track = state?.queue.shift();
  if (!state || !track) { if (state) state.current = undefined; return; }
  state.current = track;
  const stream = await play.stream(track.url, { discordPlayerCompatibility: true });
  const resource = createAudioResource(stream.stream, { inputType: stream.type as StreamType });
  state.player.play(resource);
}

export const musicService = {
  async play(member: GuildMember, query: string) {
    const channel = member.voice.channel;
    if (!channel || !(channel instanceof VoiceChannel)) throw new Error('Join a voice channel first.');
    let state = players.get(member.guild.id);
    if (!state) {
      const connection = joinVoiceChannel({ channelId: channel.id, guildId: member.guild.id, adapterCreator: member.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator });
      const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
      connection.subscribe(player);
      state = { connection, player, queue: [] };
      players.set(member.guild.id, state);
      player.on(AudioPlayerStatus.Idle, () => { void playNext(member.guild.id); });
      connection.on('error', () => this.stop(member.guild.id));
    }
    const track = await resolveTrack(query, member.user.tag);
    const wasIdle = !state.current;
    state.queue.push(track);
    if (wasIdle) await playNext(member.guild.id);
    return { track, position: state.queue.length };
  },
  skip(guildId: string) { const state = players.get(guildId); if (!state) return false; state.player.stop(); return true; },
  pause(guildId: string) { const state = players.get(guildId); return Boolean(state?.player.pause()); },
  resume(guildId: string) { const state = players.get(guildId); return Boolean(state?.player.unpause()); },
  queue(guildId: string) { const state = players.get(guildId); return { current: state?.current, queue: state?.queue ?? [] }; },
  stop(guildId: string) { const state = players.get(guildId); if (!state) return false; state.player.stop(); state.connection.destroy(); players.delete(guildId); return true; },
};
