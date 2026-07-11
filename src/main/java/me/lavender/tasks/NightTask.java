package me.lavender.tasks;

import me.lavender.core.LavenderRP;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.World;
import org.bukkit.scheduler.BukkitRunnable;

public class NightTask extends BukkitRunnable {

    private boolean wasNight = false;

    @Override
    public void run() {

        World world = Bukkit.getWorlds().getFirst();

        long time = world.getTime();

        boolean night = time >= 13000 && time <= 23000;

        if (night && !wasNight) {

            Bukkit.broadcastMessage("");
            Bukkit.broadcastMessage(ChatColor.DARK_RED + "☾ Night has fallen...");
            Bukkit.broadcastMessage(ChatColor.GRAY + "Stay inside.");
            Bukkit.broadcastMessage("");

            wasNight = true;

        }

        if (!night && wasNight) {

            Bukkit.broadcastMessage("");
            Bukkit.broadcastMessage(ChatColor.YELLOW + "☀ The sun rises...");
            Bukkit.broadcastMessage(ChatColor.GRAY + "You are safer... for now.");
            Bukkit.broadcastMessage("");

            wasNight = false;

        }

    }

}