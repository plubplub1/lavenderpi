package me.lavender.game;

import org.bukkit.*;
import org.bukkit.block.Block;
import org.bukkit.entity.EntityType;
import org.bukkit.entity.Zombie;
import java.util.ArrayList;
import java.util.List;
import me.lavender.core.LavenderRP;

import java.util.Random;

public class PlaneCrashManager {

    private final Random random = new Random();
    private final List<CrashSite> crashSites = new ArrayList<>();

    public void spawnCrash(World world, Location center) {

world.createExplosion(
        center,
        2.0f,
        false,
        false
);

buildWreck(world, center);

CrashSite site = new CrashSite(center);

crashSites.add(site);

new CrashSiteTask(site)
        .runTaskTimer(
                LavenderRP.getInstance(),
                0L,
                40L
        );

        // ไฟรอบ ๆ
        for (int x = -2; x <= 2; x++) {
            for (int z = -2; z <= 2; z++) {

                if (random.nextBoolean()) {

                    Block block = center.clone().add(x, 0, z).getBlock();

                    if (block.getType() == Material.AIR)
                        block.setType(Material.FIRE);

                }

            }
        }

        // ควัน
        world.spawnParticle(
                Particle.CAMPFIRE_COSY_SMOKE,
                center.clone().add(0, 1, 0),
                80,
                1,
                1,
                1,
                0.03
        );

        world.spawnParticle(
        Particle.LARGE_SMOKE,
        center.clone().add(0,2,0),
        120,
        0.8,
        1,
        0.8,
        0.02
);

        // ซอมบี้เฝ้า
        for (int i = 0; i < 6; i++) {

            Location spawn = center.clone().add(
                    random.nextInt(8) - 4,
                    0,
                    random.nextInt(8) - 4
            );

            Zombie zombie = (Zombie) world.spawnEntity(
                    spawn,
                    EntityType.ZOMBIE
            );

            zombie.setAdult();

        }

        Bukkit.broadcastMessage("");
        Bukkit.broadcastMessage("§4✈ Aircraft crash reported.");
        Bukkit.broadcastMessage("§7Smoke can be seen in the distance...");
        Bukkit.broadcastMessage("");

    }

    private void buildWreck(World world, Location center) {



    // ลำตัวเครื่องบิน
    for (int x = -4; x <= 4; x++) {

        world.getBlockAt(
                center.clone().add(x, 0, 0)
        ).setType(Material.IRON_BLOCK);

    }

    // ปีกซ้าย
    for (int z = -3; z <= 3; z++) {

        world.getBlockAt(
                center.clone().add(-1, 0, z)
        ).setType(Material.IRON_BLOCK);

    }

    // ปีกขวา
    for (int z = -3; z <= 3; z++) {

        world.getBlockAt(
                center.clone().add(2, 0, z)
        ).setType(Material.IRON_BLOCK);

    }

// เหล็กหัก ๆ
world.getBlockAt(center.clone().add(0,1,0))
        .setType(Material.IRON_BARS);

world.getBlockAt(center.clone().add(1,1,0))
        .setType(Material.IRON_BARS);

} // <-- ปิด buildWreck()

public List<CrashSite> getCrashSites() {
    return crashSites;
}

public boolean hasActiveCrash() {

    for (CrashSite site : crashSites) {

        if (site.isActive()) {
            return true;
        }

    }

    return false;

}

} // <-- ปิด PlaneCrashManager

