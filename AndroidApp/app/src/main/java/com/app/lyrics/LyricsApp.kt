package com.app.lyrics

import android.app.Application
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin

import com.app.lyrics.di.appModule

class LyricsApp : Application() {
    override fun onCreate() {
        super.onCreate()
        
        startKoin {
            androidLogger()
            androidContext(this@LyricsApp)
            modules(
                appModule
            )
        }
    }
}
