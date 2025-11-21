package com.app.lyrics.di

import com.app.lyrics.data.repository.NetworkSongRepositoryImpl
import com.app.lyrics.domain.repository.SongRepository
import com.app.lyrics.presentation.home.HomeViewModel
import com.app.lyrics.presentation.details.LyricsDetailViewModel
import com.app.lyrics.presentation.favorites.FavoritesViewModel
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.module

val appModule = module {

    // Database
    single {
        androidx.room.Room.databaseBuilder(
            androidContext(),
            com.app.lyrics.data.local.LyricsDatabase::class.java,
            "lyrics_db"
        ).build()
    }
    single { get<com.app.lyrics.data.local.LyricsDatabase>().songDao() }

    // Network
    single {
        io.ktor.client.HttpClient(io.ktor.client.engine.okhttp.OkHttp) {
            install(io.ktor.client.plugins.contentnegotiation.ContentNegotiation) {
                io.ktor.serialization.kotlinx.json.json(
                    kotlinx.serialization.json.Json {
                        ignoreUnknownKeys = true
                        prettyPrint = true
                        isLenient = true
                    }
                )
            }
            install(io.ktor.client.plugins.logging.Logging) {
                level = io.ktor.client.plugins.logging.LogLevel.ALL
            }
        }
    }

    single<SongRepository> { NetworkSongRepositoryImpl(get(), get()) }
    
    // ViewModels
    factory { HomeViewModel(get()) }
    factory { LyricsDetailViewModel(get()) }
    factory { FavoritesViewModel(get()) }
}
