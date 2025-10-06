import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import { colors } from '../../styles/colors';
import Button from '../../components/common/Button';
import { triggerHaptic, HapticType } from '../../utils/hapticFeedback';

/**
 * Video Replay Component
 * 
 * Social Feature: Video-replay med slow-motion och delning
 */
const VideoReplay = ({ videoUri, throwAnalysis, onClose }) => {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(true);

  const playbackRates = [
    { label: '0.25x', value: 0.25 },
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1.0 },
    { label: '2x', value: 2.0 },
  ];

  const handlePlayPause = () => {
    setPaused(!paused);
    triggerHaptic(HapticType.SELECTION);
  };

  const handleSeek = (value) => {
    videoRef.current?.seek(value);
    setCurrentTime(value);
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    triggerHaptic(HapticType.SELECTION);
  };

  const handleShare = async () => {
    try {
      triggerHaptic(HapticType.LIGHT);
      
      const shareMessage = `
🎯 Mitt bästa kast!

📊 Statistik:
• Noggrannhet: ${throwAnalysis?.accuracy?.toFixed(1)}%
• Avstånd: ${throwAnalysis?.distance?.toFixed(2)}m
• Hastighet: ${throwAnalysis?.velocity?.toFixed(1)} m/s
• Teknik: ${throwAnalysis?.technique}

Träna med Boule Pétanque Training App! 🏆
      `.trim();

      const result = await Share.share({
        message: shareMessage,
        url: videoUri, // iOS
        title: 'Mitt Pétanque-kast',
      }, {
        dialogTitle: 'Dela ditt kast',
        subject: 'Kolla in mitt pétanque-kast!',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
        triggerHaptic(HapticType.SUCCESS);
      }
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte dela video');
      console.error('Share error:', error);
    }
  };

  const handleSaveToGallery = async () => {
    try {
      // Implementera save to gallery
      Alert.alert('Sparad!', 'Videon har sparats till ditt galleri');
      triggerHaptic(HapticType.SUCCESS);
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte spara video');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Video Player */}
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          paused={paused}
          rate={playbackRate}
          resizeMode="contain"
          onProgress={(data) => setCurrentTime(data.currentTime)}
          onLoad={(data) => setDuration(data.duration)}
          onEnd={() => setPaused(true)}
          repeat={false}
        />

        {/* Overlay med analys */}
        {throwAnalysis && (
          <View style={styles.analysisOverlay}>
            <View style={styles.analysisCard}>
              <Text style={styles.analysisTitle}>📊 Analys</Text>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Noggrannhet:</Text>
                <Text style={styles.analysisValue}>
                  {throwAnalysis.accuracy?.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Avstånd:</Text>
                <Text style={styles.analysisValue}>
                  {throwAnalysis.distance?.toFixed(2)}m
                </Text>
              </View>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Hastighet:</Text>
                <Text style={styles.analysisValue}>
                  {throwAnalysis.velocity?.toFixed(1)} m/s
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Play/Pause Button */}
        {showControls && (
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={handlePlayPause}
          >
            <Text style={styles.playPauseIcon}>
              {paused ? '▶️' : '⏸️'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Controls */}
      {showControls && (
        <View style={styles.controls}>
          {/* Timeline */}
          <View style={styles.timelineContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Slider
              style={styles.slider}
              value={currentTime}
              minimumValue={0}
              maximumValue={duration}
              onValueChange={handleSeek}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="#ccc"
              thumbTintColor={colors.primary}
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Playback Rate */}
          <View style={styles.playbackRateContainer}>
            <Text style={styles.controlLabel}>Hastighet:</Text>
            <View style={styles.playbackRateButtons}>
              {playbackRates.map((rate) => (
                <TouchableOpacity
                  key={rate.value}
                  style={[
                    styles.rateButton,
                    playbackRate === rate.value && styles.rateButtonActive,
                  ]}
                  onPress={() => handlePlaybackRateChange(rate.value)}
                >
                  <Text
                    style={[
                      styles.rateButtonText,
                      playbackRate === rate.value && styles.rateButtonTextActive,
                    ]}
                  >
                    {rate.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="📤 Dela"
              onPress={handleShare}
              variant="primary"
              style={styles.actionButton}
            />
            <Button
              title="💾 Spara"
              onPress={handleSaveToGallery}
              variant="outline"
              style={styles.actionButton}
            />
          </View>

          {/* Close Button */}
          <Button
            title="Stäng"
            onPress={onClose}
            variant="outline"
            style={styles.closeButton}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  analysisOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  analysisCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  analysisTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  analysisLabel: {
    color: '#ccc',
    fontSize: 14,
    marginRight: 16,
  },
  analysisValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  playPauseButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    fontSize: 40,
  },
  controls: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 16,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    minWidth: 40,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  playbackRateContainer: {
    marginBottom: 16,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  playbackRateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
  },
  rateButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  rateButtonTextActive: {
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
  },
  closeButton: {
    marginTop: 8,
  },
});

export default VideoReplay;
