export function buildCategoryIndex(playlists) {
  const categoryMap = {}; 

  for (let i = 0; i < playlists.length; i++) {
    const song = playlists[i];

    for (let j = 0; j < song.categories.length; j++) {
      const category = song.categories[j];

      if (categoryMap[category] === undefined) {
        categoryMap[category] = [];
      }

      categoryMap[category].push(song);
    }
  }
  return categoryMap;
}

