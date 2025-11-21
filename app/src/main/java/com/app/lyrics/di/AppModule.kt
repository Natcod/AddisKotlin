package com.app.lyrics.di

import com.app.lyrics.data.repository.MockSongRepositoryImpl
import com.app.lyrics.domain.repository.SongRepository
import com.app.lyrics.presentation.home.HomeViewModel
import com.app.lyrics.presentation.details.LyricsDetailViewModel
import org.koin.dsl.module

val appModule = module {
    single<SongRepository> { MockSongRepositoryImpl() }
    
    // ViewModels
    factory { HomeViewModel(get()) }
    factory { LyricsDetailViewModel(get()) }
}
