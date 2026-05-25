import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Oswald_400Regular, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { View, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';

import { colors } from './src/theme';
import { AppProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import TimetableScreen from './src/screens/TimetableScreen';
import BlockTimetableScreen from './src/screens/BlockTimetableScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import PerformanceDetailScreen from './src/screens/PerformanceDetailScreen';
import RoutesScreen from './src/screens/RoutesScreen';
import RouteDetailScreen from './src/screens/RouteDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const navigationRef = useRef(null);

    const [fontsLoaded] = useFonts({
        Oswald_400Regular,
        Oswald_600SemiBold,
        Oswald_700Bold,
    });

    // Notificatie-tap handler — navigeer naar de juiste plek.
    useEffect(() => {
        const sub = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data || {};
            if (data.url) {
                if (data.openInBrowser) Linking.openURL(data.url);
                else Linking.openURL(data.url);
                return;
            }
            // Voor performance notifications hebben we nu nog geen directe lookup
            // mogelijkheid zonder timetable data — gewoon naar Home navigeren.
            if (navigationRef.current?.isReady()) {
                navigationRef.current.navigate('Home');
            }
        });
        return () => sub.remove();
    }, []);

    if (!fontsLoaded) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <AppProvider>
                <NavigationContainer ref={navigationRef}>
                    <StatusBar style="light" />
                    <Stack.Navigator
                        initialRouteName="Home"
                        screenOptions={{
                            headerStyle: { backgroundColor: colors.primary },
                            headerTintColor: colors.textOnDark,
                            headerTitleStyle: { fontFamily: 'Oswald_600SemiBold' },
                            contentStyle: { backgroundColor: colors.appBackground },
                        }}
                    >
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{ title: 'CTF Timetable' }}
                        />
                        <Stack.Screen
                            name="Timetable"
                            component={TimetableScreen}
                            options={({ route }) => ({ title: route.params?.event ?? 'Timetable' })}
                        />
                        <Stack.Screen
                            name="BlockTimetable"
                            component={BlockTimetableScreen}
                            options={({ route }) => ({ title: `${route.params?.event ?? ''} — Blokken` })}
                        />
                        <Stack.Screen
                            name="Favorites"
                            component={FavoritesScreen}
                            options={{ title: 'Favorieten' }}
                        />
                        <Stack.Screen
                            name="PerformanceDetail"
                            component={PerformanceDetailScreen}
                            options={{ title: 'Voorstelling' }}
                        />
                        <Stack.Screen
                            name="Routes"
                            component={RoutesScreen}
                            options={{ title: 'Routes' }}
                        />
                        <Stack.Screen
                            name="RouteDetail"
                            component={RouteDetailScreen}
                            options={{ title: 'Route' }}
                        />
                        <Stack.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{ title: 'Instellingen' }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </AppProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.appBackground,
    },
});
