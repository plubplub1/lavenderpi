package me.lavender.world;

import me.lavender.core.LavenderRP;
import org.bukkit.Bukkit;
import org.bukkit.Sound;
import org.bukkit.entity.Player;

public class DayManager {

    private final WorldState worldState;

    public DayManager(WorldState worldState) {
        this.worldState = worldState;
    }

    public void nextDay() {

        Phase oldPhase = worldState.getPhase();

        worldState.nextDay();

        LavenderRP.getInstance()
                .getBootstrap()
                .getWorldDataManager()
                .save(worldState);

        Bukkit.getLogger().info(
                "[Lavender] Day " + worldState.getDay()
        );

        for (Player player : Bukkit.getOnlinePlayers()) {

            player.sendTitle(
                    "§cDAY " + worldState.getDay(),
                    "§7" + worldState.getPhase().getTitle(),
                    20,
                    80,
                    20
            );

            player.playSound(
                    player.getLocation(),
                    Sound.BLOCK_BELL_USE,
                    1f,
                    0.7f
            );

        }

        if (oldPhase != worldState.getPhase()) {

            LavenderRP.getInstance().getLogger().info(
                    "Phase Changed -> " + worldState.getPhase().name()
            );

        }

    }

    public long getCurrentDay() {
        return worldState.getDay();
    }

}