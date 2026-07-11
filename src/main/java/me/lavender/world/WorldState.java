package me.lavender.world;

public class WorldState {

    private long day = 1;

    private Phase phase = Phase.COLLAPSE;

    public long getDay() {
        return day;
    }

    public Phase getPhase() {
        return phase;
    }

    public void nextDay() {

        day++;

        updatePhase();

    }

    public void setDay(long day) {

        this.day = Math.max(1, day);

        updatePhase();

    }

    private void updatePhase() {

        Phase current = phase;

        for (Phase value : Phase.values()) {

            if (day >= value.getUnlockDay()) {
                current = value;
            }

        }

        phase = current;

    }

}