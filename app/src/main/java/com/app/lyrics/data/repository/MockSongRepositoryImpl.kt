package com.app.lyrics.data.repository

import com.app.lyrics.domain.model.Song
import com.app.lyrics.domain.repository.SongRepository
import com.app.lyrics.data.local.entity.toDomain
import com.app.lyrics.data.local.entity.toEntity
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class MockSongRepositoryImpl(
    private val dao: com.app.lyrics.data.local.dao.SongDao
) : SongRepository {

    private val mockSongs = listOf(
        Song(
            id = "1",
            title = "Tirhas",
            artist = "Yared Yifru",
            lyrics = "Sample Amharic Lyrics for Tirhas...",
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
        val localSong = dao.getSongById(songId)
        if (localSong != null) {
            return localSong.toDomain()
        }
        return mockSongs.find { it.id == songId } ?: throw Exception("Song not found")
    }

    override fun getFavoriteSongs(): Flow<List<Song>> {
        return dao.getFavoriteSongs().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override suspend fun toggleFavorite(song: Song) {
        val isFav = !song.isFavorite
        if (isFav) {
            dao.insertSong(song.copy(isFavorite = true).toEntity())
        } else {
            dao.updateFavoriteStatus(song.id, false)
            dao.deleteSong(song.toEntity()) // Or just update status, but delete is cleaner for "Favorites only" table if we had one. 
            // But here we are using a single table for everything? 
            // Wait, my DAO logic: insertSong replaces. updateFavoriteStatus updates.
            // If I want to keep the song in DB but just un-favorite it:
            dao.updateFavoriteStatus(song.id, false)
        }
    }

    override suspend fun getRecentSearches(): List<String> {
        return recentSearches.reversed().distinct().take(5)
    }
}
