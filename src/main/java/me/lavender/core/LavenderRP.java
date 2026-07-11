package me.lavender.core;

import me.lavender.commands.LavenderCommand;
import me.lavender.events.ZombieListener;
import me.lavender.loot.LootListener;
import org.bukkit.plugin.java.JavaPlugin;

public class LavenderRP extends JavaPlugin {

    private static LavenderRP instance;

    private Bootstrap bootstrap;

    @Override
    public void onEnable() {

        instance = this;

        bootstrap = new Bootstrap(this);

        // Commands
        getCommand("lav").setExecutor(new LavenderCommand());

        // Listeners
        getServer().getPluginManager().registerEvents(
                new ZombieListener(),
                this
        );

        getServer().getPluginManager().registerEvents(
                new LootListener(this),
                this
        );

        // Initialize systems
        bootstrap.initialize();

        getLogger().info("");
        getLogger().info("==============================");
        getLogger().info("PROJECT LAVENDER");
        getLogger().info("v0.0.2");
        getLogger().info("==============================");
    }

    @Override
    public void onDisable() {

        if (bootstrap != null) {
            bootstrap.getModuleManager().shutdown();
        }

        getLogger().info("Project Lavender Disabled.");
    }

    public static LavenderRP getInstance() {
        return instance;
    }

    public Bootstrap getBootstrap() {
        return bootstrap;
    }

}