import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../styles/colors';
import Button from '../../components/common/Button';
import { triggerHaptic, HapticType } from '../../utils/hapticFeedback';

/**
 * Accessibility Settings
 * 
 * Inställningar för tillgänglighet:
 * - Färgblind-läge
 * - Hög kontrast
 * - Större text
 * - Röstkommandon
 * - Text-to-speech
 * - Haptic feedback
 */

const STORAGE_KEY = 'accessibility_settings';

// Färgblind-paletter
const COLOR_BLIND_MODES = {
  normal: {
    name: 'Normal',
    primary: '#2E7D32',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  protanopia: {
    name: 'Protanopia (Röd-grön)',
    primary: '#0D47A1',
    success: '#1976D2',
    warning: '#FFA000',
    error: '#D32F2F',
    info: '#0288D1',
  },
  deuteranopia: {
    name: 'Deuteranopia (Grön-svaghet)',
    primary: '#1565C0',
    success: '#1E88E5',
    warning: '#F57C00',
    error: '#E53935',
    info: '#039BE5',
  },
  tritanopia: {
    name: 'Tritanopia (Blå-gul)',
    primary: '#C62828',
    success: '#E53935',
    warning: '#00897B',
    error: '#D81B60',
    info: '#00ACC1',
  },
};

const AccessibilitySettings = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState({
    colorBlindMode: 'normal',
    highContrast: false,
    largeText: false,
    voiceCommands: false,
    textToSpeech: false,
    hapticFeedback: true,
    screenReader: false,
    reduceMotion: false,
  });

  const [textSizeMultiplier, setTextSizeMultiplier] = useState(1.0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        applySettings(parsed);
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      applySettings(newSettings);
      
      if (onSettingsChange) {
        onSettingsChange(newSettings);
      }
      
      triggerHaptic(HapticType.SUCCESS);
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  const applySettings = (newSettings) => {
    // Applicera färgblind-läge
    if (newSettings.colorBlindMode !== 'normal') {
      const palette = COLOR_BLIND_MODES[newSettings.colorBlindMode];
      // Uppdatera globala färger
      Object.assign(colors, palette);
    }

    // Applicera textstorlek
    if (newSettings.largeText) {
      setTextSizeMultiplier(1.3);
    } else {
      setTextSizeMultiplier(1.0);
    }
  };

  const toggleSetting = (key) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    saveSettings(newSettings);
  };

  const changeColorBlindMode = (mode) => {
    const newSettings = {
      ...settings,
      colorBlindMode: mode,
    };
    saveSettings(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      colorBlindMode: 'normal',
      highContrast: false,
      largeText: false,
      voiceCommands: false,
      textToSpeech: false,
      hapticFeedback: true,
      screenReader: false,
      reduceMotion: false,
    };
    saveSettings(defaultSettings);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: 24 * textSizeMultiplier }]}>
            ♿ Tillgänglighet
          </Text>
          <Text style={[styles.subtitle, { fontSize: 14 * textSizeMultiplier }]}>
            Anpassa appen efter dina behov
          </Text>
        </View>

        {/* Färgblind-läge */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 18 * textSizeMultiplier }]}>
            🎨 Färgblind-läge
          </Text>
          <Text style={[styles.sectionDescription, { fontSize: 14 * textSizeMultiplier }]}>
            Välj färgpalett anpassad för färgblindhet
          </Text>
          
          {Object.entries(COLOR_BLIND_MODES).map(([key, mode]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.colorModeButton,
                settings.colorBlindMode === key && styles.colorModeButtonActive,
              ]}
              onPress={() => changeColorBlindMode(key)}
            >
              <View style={styles.colorModeContent}>
                <Text style={[styles.colorModeName, { fontSize: 16 * textSizeMultiplier }]}>
                  {mode.name}
                </Text>
                <View style={styles.colorPalette}>
                  <View style={[styles.colorSwatch, { backgroundColor: mode.primary }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: mode.success }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: mode.warning }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: mode.error }]} />
                </View>
              </View>
              {settings.colorBlindMode === key && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Visuella inställningar */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 18 * textSizeMultiplier }]}>
            👁️ Visuella inställningar
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { fontSize: 16 * textSizeMultiplier }]}>
                Hög kontrast
              </Text>
              <Text style={[styles.settingDescription, { fontSize: 12 * textSizeMultiplier }]}>
                Öka kontrasten för bättre läsbarhet
              </Text>
            </View>
            <Switch
              value={settings.highContrast}
              onValueChange={() => toggleSetting('highContrast')}
              trackColor={{ false: '#ccc', true: colors.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { fontSize: 16 * textSizeMultiplier }]}>
                Större text
              </Text>
              <Text style={[styles.settingDescription, { fontSize: 12 * textSizeMultiplier }]}>
                Öka textstorleken med 30%
              </Text>
            </View>
            <Switch
              value={settings.largeText}
              onValueChange={() => toggleSetting('largeText')}
              trackColor={{ false: '#ccc', true: colors.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { fontSize: 16 * textSizeMultiplier }]}>
                Reducera rörelser
              </Text>
              <Text style={[styles.settingDescription, { fontSize: 12 * textSizeMultiplier }]}>
                Minska animationer och övergångar
              </Text>
            </View>
            <Switch
              value={settings.reduceMotion}
              onValueChange={() => toggleSetting('reduceMotion')}
              trackColor={{ false: '#ccc', true: colors.primary }}
            />
          </View>
        </View>

        {/* Ljud & Röst */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 18 * textSizeMultiplier }]}>
            🔊 Ljud & Röst
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { fontSize: 16 * textSizeMultiplier }]}>
                Röstkommandon
              </Text>
              <Text style={[styles.settingDescription, { fontSize: 12 * textSizeMultiplier }]}>
                Styr appen med rösten
              </Text>
            </View>
            <Switch
              value={settings.voiceCommands}
              onValueChange={() => toggleSetting('voiceCommands')}
              trackColor={{ false: '#ccc', true: colors.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { fontSize: 16 * textSizeMultiplier }]}>
                Text-to-Speech
              </Text>
              <Text style={[styles.settingDescription, { fontSize: 12 * textSizeMultiplier }]}>
                Läs upp text och resultat
              </Text>
            </View>
            <Switch
              value={settings.textToSpeech}
              onValueChange={() => toggleSetting('textToSpeech')}
              trackColor={{ false: '#ccc', true: colors.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { fontSize: 16 * textSizeMultiplier }]}>
                Skärmläsare-stöd
              </Text>
              <Text style={[styles.settingDescription, { fontSize: 12 * textSizeMultiplier }]}>
                Optimera för VoiceOver/TalkBack
              </Text>
            </View>
            <Switch
              value={settings.screenReader}
              onValueChange={() => toggleSetting('screenReader')}
              trackColor={{ false: '#ccc', true: colors.primary }}
            />
          </View>
        </View>

        {/* Taktil feedback */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 18 * textSizeMultiplier }]}>
            📳 Taktil feedback
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { fontSize: 16 * textSizeMultiplier }]}>
                Haptic Feedback
              </Text>
              <Text style={[styles.settingDescription, { fontSize: 12 * textSizeMultiplier }]}>
                Vibrera vid interaktioner
              </Text>
            </View>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={() => toggleSetting('hapticFeedback')}
              trackColor={{ false: '#ccc', true: colors.primary }}
            />
          </View>
        </View>

        {/* Reset button */}
        <Button
          title="Återställ till standard"
          onPress={resetToDefaults}
          variant="outline"
          style={styles.resetButton}
        />

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={[styles.infoTitle, { fontSize: 14 * textSizeMultiplier }]}>
            💡 Tips
          </Text>
          <Text style={[styles.infoText, { fontSize: 12 * textSizeMultiplier }]}>
            Dessa inställningar hjälper dig att anpassa appen efter dina behov.
            Alla ändringar sparas automatiskt.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  colorModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  colorModeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  colorModeContent: {
    flex: 1,
  },
  colorModeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  checkmark: {
    fontSize: 24,
    color: colors.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  resetButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default AccessibilitySettings;
export { COLOR_BLIND_MODES };
