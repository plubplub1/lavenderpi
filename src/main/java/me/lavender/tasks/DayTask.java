package me.lavender.tasks;

import me.lavender.world.DayManager;
import org.bukkit.scheduler.BukkitRunnable;

public class DayTask extends BukkitRunnable {

    private final DayManager dayManager;

    public DayTask(DayManager dayManager) {
        this.dayManager = dayManager;
    }

    @Override
    public void run() {

        dayManager.nextDay();

    }

}