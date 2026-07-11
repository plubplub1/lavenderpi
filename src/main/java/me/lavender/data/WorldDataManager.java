package me.lavender.data;

import me.lavender.core.LavenderRP;
import me.lavender.world.WorldState;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;

import java.io.File;
import java.io.IOException;

public class WorldDataManager {

    private final LavenderRP plugin;

    private final File file;

    private FileConfiguration config;

    public WorldDataManager(LavenderRP plugin) {

        this.plugin = plugin;

        if (!plugin.getDataFolder().exists()) {
            plugin.getDataFolder().mkdirs();
        }

        file = new File(plugin.getDataFolder(), "world.yml");

        config = YamlConfiguration.loadConfiguration(file);

    }

    public void save(WorldState state) {

        config.set("day", state.getDay());

        try {
            config.save(file);
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    public long loadDay() {

        return config.getLong("day", 1);

    }

}