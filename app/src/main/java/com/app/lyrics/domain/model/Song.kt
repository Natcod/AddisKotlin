package com.app.lyrics.domain.model

data class Song(
    val id: String,
    val title: String,
    val artist: String,
    val lyrics: String,
    val category: String,
    val isFavorite: Boolean = false
)
