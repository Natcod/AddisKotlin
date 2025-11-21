package com.app.lyrics.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.app.lyrics.domain.model.Song

@Entity(tableName = "songs")
data class SongEntity(
    @PrimaryKey val id: String,
    val title: String,
    val artist: String,
    val lyrics: String,
    val category: String,
    val isFavorite: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

fun SongEntity.toDomain(): Song {
    return Song(
        id = id,
        title = title,
        artist = artist,
        lyrics = lyrics,
        category = category,
        isFavorite = isFavorite
    )
}

fun Song.toEntity(): SongEntity {
    return SongEntity(
        id = id,
        title = title,
        artist = artist,
        lyrics = lyrics,
        category = category,
        isFavorite = isFavorite
    )
}
