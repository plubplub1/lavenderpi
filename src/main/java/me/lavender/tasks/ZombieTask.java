package me.lavender.tasks;

import me.lavender.core.LavenderRP;
import me.lavender.world.WorldState;
import org.bukkit.attribute.Attribute;
import org.bukkit.entity.Zombie;
import org.bukkit.scheduler.BukkitRunnable;

public class ZombieTask extends BukkitRunnable {

    @Override
    public void run() {

        WorldState state = LavenderRP.getInstance()
                .getBootstrap()
                .getWorldState();

        long day = state.getDay();

        double hp = 20 + (day * 0.5);
        double damage = 3 + (day * 0.15);

        LavenderRP.getInstance().getServer().getWorlds().forEach(world -> {

            world.getEntitiesByClass(Zombie.class).forEach(zombie -> {

                zombie.getAttribute(Attribute.MAX_HEALTH).setBaseValue(hp);
                zombie.setHealth(hp);

                zombie.getAttribute(Attribute.ATTACK_DAMAGE).setBaseValue(damage);

            });

        });

    }

}