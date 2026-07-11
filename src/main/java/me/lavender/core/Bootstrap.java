package me.lavender.core;

import me.lavender.module.ModuleManager;
import me.lavender.data.WorldDataManager;
import me.lavender.game.PlaneCrashManager;
import me.lavender.tasks.AtmosphereTask;
import me.lavender.tasks.DayTask;
import me.lavender.world.AtmosphereManager;
import me.lavender.world.DayManager;
import me.lavender.world.WorldState;
import me.lavender.tasks.ZombieTask;
import me.lavender.tasks.NightTask;
import me.lavender.radio.AmbientSoundSystem;
import me.lavender.radio.RadioTask;
import me.lavender.radio.RadioManager;

public class Bootstrap {

    private final WorldDataManager worldDataManager;

    private final LavenderRP plugin;

    private final WorldState worldState;

    private final DayManager dayManager;

    private final AtmosphereManager atmosphereManager;

    private final PlaneCrashManager planeCrashManager;

    private final ModuleManager moduleManager;

    private final RadioManager radioManager;

    public Bootstrap(LavenderRP plugin) {

        this.plugin = plugin;

        this.planeCrashManager = new PlaneCrashManager();

        this.worldState = new WorldState();

        this.dayManager = new DayManager(worldState);

        this.atmosphereManager = new AtmosphereManager();

        this.worldDataManager = new WorldDataManager(plugin);

        this.worldState.setDay(worldDataManager.loadDay());

        this.moduleManager = new ModuleManager();

        this.radioManager = new RadioManager(plugin);

    }

    public ModuleManager getModuleManager() {
    return moduleManager;
}

    public void initialize() {

        plugin.getLogger().info("Loading WorldState...");
        plugin.getLogger().info("Loading DayManager...");

        new DayTask(dayManager).runTaskTimer(
                plugin,
                20L,
                24000L
        );

        new AtmosphereTask(atmosphereManager)
        .runTaskTimer(plugin,20L,200L);

        plugin.getLogger().info("Day Scheduler Started.");

        plugin.getLogger().info("Done.");

        new ZombieTask().runTaskTimer(
            plugin,
            100L,
            100L
        );

        new NightTask().runTaskTimer(
            plugin,
            20L,
            40L
        );

        new AmbientSoundSystem().runTaskTimer(
            plugin,
            20L,
            6000L
        );

        radioManager.start();

    }

    public DayManager getDayManager() {
        return dayManager;
    }

    public WorldState getWorldState() {
        return worldState;
    }

    public AtmosphereManager getAtmosphereManager() {
        return atmosphereManager;
    }

    public WorldDataManager getWorldDataManager() {
        return worldDataManager;
    }

    public PlaneCrashManager getPlaneCrashManager() {
    return planeCrashManager;
    }

    public RadioManager getRadioManager() {
    return radioManager;
}
}