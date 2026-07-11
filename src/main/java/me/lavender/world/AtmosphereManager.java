package me.lavender.world;

import org.bukkit.Bukkit;
import org.bukkit.World;

public class AtmosphereManager {

    public void update() {

        for (World world : Bukkit.getWorlds()) {

            world.setStorm(true);

            world.setThundering(false);

            world.setWeatherDuration(6000);

            world.setClearWeatherDuration(0);

        }

    }

}