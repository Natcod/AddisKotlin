package com.app.lyrics.data.remote.dto

import com.app.lyrics.domain.model.Song
import kotlinx.serialization.Serializable

@Serializable
data class SongDto(
    val id: String,
    val title: String,
    val artist: String,
    val lyrics: String,
    val category: String,
    val source: String
) {
    fun toDomain(isFavorite: Boolean = false): Song {
        return Song(
            id = id,
            title = title,
            artist = artist,
            lyrics = lyrics,
            isFavorite = isFavorite
        )
    }
}
