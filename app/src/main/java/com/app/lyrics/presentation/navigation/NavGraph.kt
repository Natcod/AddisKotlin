package com.app.lyrics.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.app.lyrics.presentation.home.HomeScreen

@Composable
fun NavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                onSongClick = { songId ->
                    navController.navigate(Screen.Details.createRoute(songId))
                }
            )
        }
        composable(Screen.Details.route) { backStackEntry ->
            val songId = backStackEntry.arguments?.getString("songId")
            // TODO: Implement Details Screen
        }
        composable(Screen.Favorites.route) {
            // TODO: Implement Favorites Screen
        }
    }
}

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Details : Screen("details/{songId}") {
        fun createRoute(songId: String) = "details/$songId"
    }
    object Favorites : Screen("favorites")
}
