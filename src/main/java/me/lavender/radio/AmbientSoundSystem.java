package me.lavender.radio;

import me.lavender.core.LavenderRP;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;
import org.bukkit.scheduler.BukkitRunnable;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class AmbientSoundSystem extends BukkitRunnable {

    private final RadioManager manager = new RadioManager();

    @Override
    public void run() {

        // มีโอกาสเกิด 15%
        if (ThreadLocalRandom.current().nextInt(100) >= 15)
            return;

        long day = LavenderRP.getInstance()
                .getBootstrap()
                .getWorldState()
                .getDay();

        RadioMessage message = manager.getMessage(day);

        if (message == null)
            return;

        List<String> lines = message.getLines();

        new BukkitRunnable() {

            int index = 0;

            @Override
            public void run() {

                if (index >= lines.size()) {

                    cancel();
                    return;

                }

                String line = lines.get(index);

                Bukkit.broadcastMessage(
                        ChatColor.DARK_GRAY +
                                "[EMERGENCY BROADCAST] "
                                + ChatColor.GRAY
                                + line
                );

                // ตรงนี้เดี๋ยวค่อยเปลี่ยนเป็นเสียงวิทยุจริง
                for (Player player : Bukkit.getOnlinePlayers()) {

                    player.playSound(
                            player.getLocation(),
                            org.bukkit.Sound.BLOCK_NOTE_BLOCK_BIT,
                            0.5f,
                            0.5f
                    );

                }

                index++;

            }

        }.runTaskTimer(
                LavenderRP.getInstance(),
                0L,
                20L
        );

    }

}