package com.lavender.system.radio;

import org.bukkit.scheduler.BukkitRunnable;

/**
 * One-shot scheduled task: attempts a broadcast, then asks RadioManager to
 * schedule the next cycle with a fresh random delay. This is intentionally
 * NOT a repeating timer — every cycle re-rolls its own delay (8-15 minutes),
 * so the loop never feels mechanical or predictable.
 *
 * This is the only scheduler in the radio system. Do not add another one.
 */
public final class RadioTask extends BukkitRunnable {

    private final RadioManager radioManager;

    public RadioTask(RadioManager radioManager) {
        this.radioManager = radioManager;
    }

    @Override
    public void run() {
        radioManager.attemptBroadcast();
        radioManager.scheduleNextTask();
    }
}
