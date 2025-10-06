import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { colors } from '../../styles/colors';
import { triggerHaptic, HapticType } from '../../utils/hapticFeedback';

/**
 * Voice Commands System
 * 
 * Accessibility: Röststyrning för handsfree-användning
 */
const VoiceCommands = ({ onCommand, enabled = true }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [lastCommand, setLastCommand] = useState(null);

  useEffect(() => {
    // Setup voice recognition
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    // Setup TTS
    Tts.setDefaultLanguage('sv-SE');
    Tts.setDefaultRate(0.5);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    setIsListening(true);
    triggerHaptic(HapticType.LIGHT);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const onSpeechResults = (event) => {
    const text = event.value[0].toLowerCase();
    setRecognizedText(text);
    processCommand(text);
  };

  const onSpeechError = (error) => {
    console.error('Speech recognition error:', error);
    setIsListening(false);
    speak('Kunde inte höra kommandot. Försök igen.');
  };

  const startListening = async () => {
    if (!enabled) {
      Alert.alert('Röstkommandon inaktiverade', 'Aktivera röstkommandon i inställningar');
      return;
    }

    try {
      await Voice.start('sv-SE');
      speak('Lyssnar...');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const speak = (text) => {
    Tts.speak(text);
  };

  const processCommand = (text) => {
    let command = null;

    // Träningskommandon
    if (text.includes('starta träning') || text.includes('börja träna')) {
      command = { type: 'START_TRAINING' };
      speak('Startar träningspass');
    }
    else if (text.includes('stoppa träning') || text.includes('avsluta träning')) {
      command = { type: 'STOP_TRAINING' };
      speak('Avslutar träningspass');
    }
    else if (text.includes('spara kast')) {
      command = { type: 'SAVE_THROW' };
      speak('Sparar kast');
    }

    // Kamerakommandon
    else if (text.includes('ta foto') || text.includes('fotografera')) {
      command = { type: 'TAKE_PHOTO' };
      speak('Tar foto');
    }
    else if (text.includes('spela in') || text.includes('starta inspelning')) {
      command = { type: 'START_RECORDING' };
      speak('Startar inspelning');
    }
    else if (text.includes('stoppa inspelning')) {
      command = { type: 'STOP_RECORDING' };
      speak('Stoppar inspelning');
    }

    // Kalibreringskommandon
    else if (text.includes('kalibrera')) {
      command = { type: 'CALIBRATE' };
      speak('Startar kalibrering');
    }

    // Mätkommandon
    else if (text.includes('mät avstånd') || text.includes('visa avstånd')) {
      command = { type: 'MEASURE_DISTANCE' };
      speak('Mäter avstånd');
    }

    // Statistikkommandon
    else if (text.includes('visa statistik') || text.includes('statistik')) {
      command = { type: 'SHOW_STATS' };
      speak('Visar statistik');
    }

    // Hjälpkommandon
    else if (text.includes('hjälp') || text.includes('kommandon')) {
      command = { type: 'SHOW_HELP' };
      speakAvailableCommands();
    }

    // AR-kommandon
    else if (text.includes('visa bana') || text.includes('aktivera bana')) {
      command = { type: 'SHOW_TRAJECTORY' };
      speak('Visar virtuell bana');
    }
    else if (text.includes('dölj bana')) {
      command = { type: 'HIDE_TRAJECTORY' };
      speak('Döljer virtuell bana');
    }

    // Okänt kommando
    else {
      speak('Okänt kommando. Säg "hjälp" för att höra tillgängliga kommandon.');
    }

    if (command) {
      setLastCommand(command);
      triggerHaptic(HapticType.SUCCESS);
      
      if (onCommand) {
        onCommand(command);
      }
    }
  };

  const speakAvailableCommands = () => {
    const commands = `
      Tillgängliga kommandon:
      Starta träning,
      Stoppa träning,
      Ta foto,
      Spela in,
      Stoppa inspelning,
      Kalibrera,
      Mät avstånd,
      Visa statistik,
      Visa bana,
      Dölj bana.
    `;
    speak(commands);
  };

  return (
    <View style={styles.container}>
      {/* Voice button */}
      <TouchableOpacity
        style={[
          styles.voiceButton,
          isListening && styles.voiceButtonActive,
        ]}
        onPress={isListening ? stopListening : startListening}
        onLongPress={speakAvailableCommands}
      >
        <Text style={styles.voiceIcon}>
          {isListening ? '🎤' : '🎙️'}
        </Text>
        <Text style={styles.voiceButtonText}>
          {isListening ? 'Lyssnar...' : 'Tryck för röstkommando'}
        </Text>
      </TouchableOpacity>

      {/* Recognized text */}
      {recognizedText && (
        <View style={styles.recognizedCard}>
          <Text style={styles.recognizedLabel}>Hörde:</Text>
          <Text style={styles.recognizedText}>{recognizedText}</Text>
        </View>
      )}

      {/* Last command */}
      {lastCommand && (
        <View style={styles.commandCard}>
          <Text style={styles.commandLabel}>Senaste kommando:</Text>
          <Text style={styles.commandText}>{lastCommand.type}</Text>
        </View>
      )}

      {/* Help hint */}
      <View style={styles.helpHint}>
        <Text style={styles.helpText}>
          💡 Håll inne för att höra tillgängliga kommandon
        </Text>
      </View>
    </View>
  );
};

/**
 * Text-to-Speech Helper
 * Läser upp text för användaren
 */
export const speakText = (text, options = {}) => {
  const {
    language = 'sv-SE',
    rate = 0.5,
    pitch = 1.0,
  } = options;

  Tts.setDefaultLanguage(language);
  Tts.setDefaultRate(rate);
  Tts.setDefaultPitch(pitch);
  Tts.speak(text);
};

/**
 * Speak throw analysis
 */
export const speakThrowAnalysis = (analysis) => {
  const text = `
    Kastanalys:
    Noggrannhet: ${analysis.accuracy.toFixed(0)} procent.
    Avstånd: ${analysis.distance.toFixed(2)} meter.
    Hastighet: ${analysis.velocity.toFixed(1)} meter per sekund.
    Teknik: ${analysis.technique}.
  `;
  speakText(text);
};

/**
 * Speak distance measurement
 */
export const speakDistance = (distance) => {
  const meters = Math.floor(distance);
  const centimeters = Math.round((distance - meters) * 100);
  
  let text = '';
  if (meters > 0) {
    text += `${meters} meter `;
  }
  text += `${centimeters} centimeter`;
  
  speakText(text);
};

/**
 * Speak achievement unlock
 */
export const speakAchievement = (achievement) => {
  const text = `
    Achievement upplåst!
    ${achievement.title}.
    ${achievement.description}.
    Du fick ${achievement.points} poäng.
  `;
  speakText(text);
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  voiceButton: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  voiceButtonActive: {
    backgroundColor: colors.error,
  },
  voiceIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recognizedCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  recognizedLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  recognizedText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  commandCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  commandLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  commandText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  helpHint: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default VoiceCommands;
export { speakThrowAnalysis, speakDistance, speakAchievement };
