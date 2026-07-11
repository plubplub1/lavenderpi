package com.lavender.system.radio;

/**
 * The different "channels" the radio can pick up.
 * Each category owns its own tuning data (weight, sound) so RadioManager
 * never needs to hard-code per-category behaviour.
 */
public enum RadioCategory {

    STATIC(50, "lavender:radio.static", 0.6f, 1.0f),
    SURVIVOR(20, "lavender:radio.broadcast", 0.8f, 1.0f),
    MILITARY(12, "lavender:radio.broadcast", 0.8f, 0.9f),
    EMERGENCY(8, "lavender:radio.broadcast", 1.0f, 0.8f),
    UNKNOWN(10, "lavender:radio.interference", 0.5f, 1.3f);

    private final int baseWeight;
    private final String soundKey;
    private final float soundVolume;
    private final float soundPitch;

    RadioCategory(int baseWeight, String soundKey, float soundVolume, float soundPitch) {
        this.baseWeight = baseWeight;
        this.soundKey = soundKey;
        this.soundVolume = soundVolume;
        this.soundPitch = soundPitch;
    }

    /**
     * The default/base likelihood weight of this category being chosen.
     * Actual selection weight can be modified at runtime via
     * RadioManager#setWeightModifier.
     */
    public int getBaseWeight() {
        return baseWeight;
    }

    /**
     * Namespaced sound key played alongside the chat message.
     * If the resource pack does not define this sound, playback simply
     * fails silently client-side — the system does not depend on it existing.
     */
    public String getSoundKey() {
        return soundKey;
    }

    public float getSoundVolume() {
        return soundVolume;
    }

    public float getSoundPitch() {
        return soundPitch;
    }
}
