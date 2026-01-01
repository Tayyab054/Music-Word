export function buildPlaylistMap(songs) {
  const map = {};

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const pid = song.playlistId;

    if (map[pid] === undefined) {
      map[pid] = [];
    }

    map[pid].push(song);
  }

  return map;
}
