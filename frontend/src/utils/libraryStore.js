class LibraryStore {
  constructor() {
    const saved = JSON.parse(localStorage.getItem("librarySongs")) || [];
    this.songs = new Map(saved);
  }

  persist() {
    localStorage.setItem(
      "librarySongs",
      JSON.stringify(Array.from(this.songs.entries()))
    );
  }

  addSong(song) {
    this.songs.set(song.id, song);
    this.persist();
  }

  removeSong(songId) {
    this.songs.delete(songId);
    this.persist();
  }

  getSongs() {
    return Array.from(this.songs.values());
  }

  hasSong(songId) {
    return this.songs.has(songId);
  }
}

export const libraryStore = new LibraryStore();
