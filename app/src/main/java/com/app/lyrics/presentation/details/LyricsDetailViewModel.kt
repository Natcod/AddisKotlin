package com.app.lyrics.presentation.details

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.app.lyrics.domain.model.Song
import com.app.lyrics.domain.repository.SongRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class LyricsDetailViewModel(
    private val repository: SongRepository
) : ViewModel() {

    private val _song = MutableStateFlow<Song?>(null)
    val song: StateFlow<Song?> = _song.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun loadSong(songId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                _song.value = repository.getSongDetails(songId)
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load song"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun toggleFavorite() {
        val currentSong = _song.value ?: return
        viewModelScope.launch {
            repository.toggleFavorite(currentSong)
            // Optimistically update UI or re-fetch
            _song.value = currentSong.copy(isFavorite = !currentSong.isFavorite)
        }
    }
}
