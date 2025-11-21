package com.app.lyrics.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.app.lyrics.data.local.dao.SongDao
import com.app.lyrics.data.local.entity.SongEntity

@Database(entities = [SongEntity::class], version = 1, exportSchema = false)
abstract class LyricsDatabase : RoomDatabase() {
    abstract fun songDao(): SongDao
}
