// ========== HOME PAGE ==========
export function groupArtistsByCategory(artists) {
  const map = {};

  for (const artist of artists) {
    if (!artist.category) continue;

    if (!map[artist.category]) {
      map[artist.category] = [];
    }
    map[artist.category].push(artist);
  }

  return map;
}

// ========== PLAYLIST PAGE ==========
export function groupSongsByPlaylist(songs) {
  const map = {};

  for (const song of songs) {
    if (!song.playlistId) continue;

    if (!map[song.playlistId]) {
      map[song.playlistId] = [];
    }
    map[song.playlistId].push(song);
  }

  return map;
}
