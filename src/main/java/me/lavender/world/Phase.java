package me.lavender.world;

public enum Phase {

    COLLAPSE(
            1,
            "THE COLLAPSE",
            "The world has fallen."
    ),

    SURVIVAL(
            10,
            "SURVIVAL",
            "Food is running out."
    ),

    FOG(
            20,
            "THE MIST",
            "Never stay outside too long."
    ),

    EVOLUTION(
            40,
            "EVOLUTION",
            "The infected are changing."
    ),

    DESPAIR(
            70,
            "NO HOPE",
            "Humanity is almost gone."
    ),

    EXTRACTION(
            100,
            "EXTRACTION",
            "A rescue signal has been detected."
    );

    private final int unlockDay;
    private final String title;
    private final String subtitle;

    Phase(int unlockDay, String title, String subtitle) {
        this.unlockDay = unlockDay;
        this.title = title;
        this.subtitle = subtitle;
    }

    public int getUnlockDay() {
        return unlockDay;
    }

    public String getTitle() {
        return title;
    }

    public String getSubtitle() {
        return subtitle;
    }
}