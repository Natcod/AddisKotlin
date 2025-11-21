package com.app.lyrics.data.repository

import com.app.lyrics.domain.model.Song
import com.app.lyrics.domain.repository.SongRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map

class MockSongRepositoryImpl : SongRepository {

    private val mockSongs = listOf(
        Song(
            id = "1",
            title = "Eyesus libel eyesus",
            artist = "Yared Yifru",
            lyrics = "Sample Amharic Lyrics for Eyesus libel eyesus...",
            category = "Mezmur"
        ),
        Song(
            id = "2",
            title = "Kidanemihret",
            artist = "Zemari Bereket",
            lyrics = "Sample Amharic Lyrics for Kidanemihret...",
            category = "Mezmur"
        ),
        Song(
            id = "3",
            title = "Egziabher",
            artist = "Zemari Dawit",
            lyrics = "Sample Amharic Lyrics for Egziabher...",
            category = "Mezmur"
        )
    )

    private val favoriteSongs = MutableStateFlow<Set<String>>(emptySet())
    private val recentSearches = mutableListOf<String>()

    override suspend fun searchSongs(query: String): List<Song> {
        delay(500) // Simulate network delay
        if (query.isEmpty()) return emptyList()
        recentSearches.add(query)
        return mockSongs.filter {
            it.title.contains(query, ignoreCase = true) || it.artist.contains(query, ignoreCase = true)
        }
    }

    override suspend fun getSongDetails(songId: String): Song {
        delay(300)
        return mockSongs.find { it.id == songId } ?: throw Exception("Song not found")
    }

    override fun getFavoriteSongs(): Flow<List<Song>> {
        return favoriteSongs.map { ids ->
            mockSongs.filter { ids.contains(it.id) }
        }
    }

    override suspend fun toggleFavorite(song: Song) {
        val current = favoriteSongs.value.toMutableSet()
        if (current.contains(song.id)) {
            current.remove(song.id)
        } else {
            current.add(song.id)
        }
        favoriteSongs.value = current
    }

    override suspend fun getRecentSearches(): List<String> {
        return recentSearches.reversed().distinct().take(5)
    }
}
