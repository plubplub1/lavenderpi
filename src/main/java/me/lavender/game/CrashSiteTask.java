package me.lavender.game;

import org.bukkit.Location;
import org.bukkit.Particle;
import org.bukkit.World;
import org.bukkit.scheduler.BukkitRunnable;

public class CrashSiteTask extends BukkitRunnable {

private final CrashSite site;

public CrashSiteTask(CrashSite site){

    this.site = site;

}

@Override
public void run() {

    if (!site.isActive()) {
        cancel();
        return;
    }

    if(site.isExpired()){

    site.deactivate();

    cancel();

    return;

}

    Location center = site.getLocation();

    World world = center.getWorld();

    if (world == null) {
        cancel();
        return;
    }

    world.spawnParticle(
            Particle.CAMPFIRE_COSY_SMOKE,
            center.clone().add(0, 1, 0),
            12,
            1,
            1,
            1,
            0.02
    );

    world.spawnParticle(
            Particle.LARGE_SMOKE,
            center.clone().add(0, 2, 0),
            8,
            0.6,
            0.6,
            0.6,
            0.01
    );

}

}