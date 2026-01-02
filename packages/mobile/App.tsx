import React, { useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';

// Cambia esta URL a la IP de tu PC cuando estés en desarrollo
// En producción, usa tu dominio real
const WEB_APP_URL = 'https://sexysecret.com.ar';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const webViewRef = useRef<WebView>(null);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar style="light" />
        <Text style={styles.errorText}>📡</Text>
        <Text style={styles.errorTitle}>Sin conexión a Internet</Text>
        <Text style={styles.errorMessage}>
          Por favor, verifica tu conexión y vuelve a intentar
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar style="light" />
        <Text style={styles.errorText}>⚠️</Text>
        <Text style={styles.errorTitle}>Error al cargar</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.statusBarSpacer} />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff00ff" />
          <Text style={styles.loadingText}>Cargando SexySecret...</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        onLoadStart={() => {
          if (!initialLoadComplete) {
            setLoading(true);
          }
        }}
        onLoadEnd={() => {
          setLoading(false);
          setInitialLoadComplete(true);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setError(`Error: ${nativeEvent.description}`);
          setLoading(false);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  statusBarSpacer: {
    height: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    backgroundColor: '#1a1a1a',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 20,
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
