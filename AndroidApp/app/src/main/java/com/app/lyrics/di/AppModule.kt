package com.app.lyrics.di

import com.app.lyrics.data.repository.NetworkSongRepositoryImpl
import com.app.lyrics.domain.repository.SongRepository
import com.app.lyrics.presentation.home.HomeViewModel
import com.app.lyrics.presentation.details.LyricsDetailViewModel
import com.app.lyrics.presentation.favorites.FavoritesViewModel
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logging
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
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
        HttpClient(OkHttp) {
            install(ContentNegotiation) {
                json(Json {
                    ignoreUnknownKeys = true
                    prettyPrint = true
                    isLenient = true
                })
            }
            install(Logging) {
                level = LogLevel.ALL
            }
        }
    }

    single<SongRepository> { NetworkSongRepositoryImpl(get(), get()) }
    
    // ViewModels
    factory { HomeViewModel(get()) }
    factory { LyricsDetailViewModel(get()) }
    factory { FavoritesViewModel(get()) }
}
