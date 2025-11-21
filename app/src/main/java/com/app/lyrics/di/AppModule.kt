package com.app.lyrics.di

import com.app.lyrics.data.repository.MockSongRepositoryImpl
import com.app.lyrics.domain.repository.SongRepository
import com.app.lyrics.presentation.home.HomeViewModel
import com.app.lyrics.presentation.details.LyricsDetailViewModel
import com.app.lyrics.presentation.favorites.FavoritesViewModel
import org.koin.dsl.module

val appModule = module {

    // Database
    single {
        androidx.room.Room.databaseBuilder(
            org.koin.android.ext.koin.androidContext(),
            com.app.lyrics.data.local.LyricsDatabase::class.java,
            "lyrics_db"
        ).build()
    }
    single { get<com.app.lyrics.data.local.LyricsDatabase>().songDao() }

    single<SongRepository> { MockSongRepositoryImpl(get()) }
    
    // ViewModels
    factory { HomeViewModel(get()) }
    factory { LyricsDetailViewModel(get()) }
    factory { FavoritesViewModel(get()) }
}
