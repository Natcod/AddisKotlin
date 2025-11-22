package com.app.lyrics.data.repository

import com.app.lyrics.data.local.dao.SongDao
import com.app.lyrics.data.local.entity.SongEntity
import com.app.lyrics.data.local.entity.toDomain
import com.app.lyrics.data.local.entity.toEntity
import com.app.lyrics.data.remote.dto.SongDto
import com.app.lyrics.domain.model.Song
import com.app.lyrics.domain.repository.SongRepository
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class NetworkSongRepositoryImpl(
    private val client: HttpClient,
    private val dao: SongDao
) : SongRepository {

    // Use 10.0.2.2 for Android Emulator to access localhost
    private val baseUrl = "https://lyrics-app-backend-x5o3.onrender.com/api"

    override suspend fun searchSongs(query: String): List<Song> {
        android.util.Log.d("LyricsApp", "Searching for: $query at $baseUrl/search")
        return try {
            val response: List<SongDto> = client.get("$baseUrl/search") {
                parameter("q", query)
            }.body()

            android.util.Log.d("LyricsApp", "Search success. Found ${response.size} items")

            // Check if songs are in favorites
            response.map { dto ->
                val isFavorite = dao.getSongById(dto.id) != null
                dto.toDomain(isFavorite)
            }
        } catch (e: Exception) {
            if (e is kotlinx.coroutines.CancellationException) throw e
            android.util.Log.e("LyricsApp", "Search failed", e)
            e.printStackTrace()
            emptyList()
        }
    }

    override suspend fun getSongDetails(songId: String): Song {
        // For now, we don't have a specific details endpoint,

        // we assume we have the data or we could fetch it again.
        // But since our search returns full lyrics, we might not need this if we pass data around.
        // However, to stick to the interface, we check local first, then maybe fail or re-search.
        
        val localSong = dao.getSongById(songId)
        if (localSong != null) {
            return localSong.toDomain()
        }
        
        // In a real app, we would call client.get("$baseUrl/songs/$songId")
        // For this V1 scraper, we might need to re-search or handle it differently.
        // Let's throw for now if not found locally, or we can implement a "get by url" endpoint later.
        throw Exception("Song not found locally and API doesn't support direct fetch by ID yet")
    }

    override fun getFavoriteSongs(): Flow<List<Song>> {
        return dao.getFavoriteSongs().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override suspend fun toggleFavorite(song: Song) {
        val existing = dao.getSongById(song.id)
        if (existing != null) {
            dao.deleteSong(existing)
        } else {
            dao.insertSong(song.toEntity())
        }
    }

    override suspend fun getRecentSearches(): List<String> {
        return emptyList() // Implement later
    }
}
