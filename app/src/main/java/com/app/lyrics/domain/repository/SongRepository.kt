package com.app.lyrics.domain.repository

import com.app.lyrics.domain.model.Song
import kotlinx.coroutines.flow.Flow

interface SongRepository {
    suspend fun searchSongs(query: String): List<Song>
    suspend fun getSongDetails(songId: String): Song
    fun getFavoriteSongs(): Flow<List<Song>>
    suspend fun toggleFavorite(song: Song)
    suspend fun getRecentSearches(): List<String>
}
