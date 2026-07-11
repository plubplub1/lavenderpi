package me.lavender.tasks;

import me.lavender.world.AtmosphereManager;
import org.bukkit.scheduler.BukkitRunnable;

public class AtmosphereTask extends BukkitRunnable {

    private final AtmosphereManager manager;

    public AtmosphereTask(AtmosphereManager manager) {
        this.manager = manager;
    }

    @Override
    public void run() {

        manager.update();

    }

}