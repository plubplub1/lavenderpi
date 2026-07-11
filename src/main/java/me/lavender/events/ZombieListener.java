package me.lavender.events;

import me.lavender.core.LavenderRP;
import me.lavender.world.WorldState;
import org.bukkit.World;
import org.bukkit.attribute.Attribute;
import org.bukkit.entity.Zombie;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.CreatureSpawnEvent;

import java.util.concurrent.ThreadLocalRandom;

public class ZombieListener implements Listener {

    @EventHandler
    public void onSpawn(CreatureSpawnEvent event) {

        if (!(event.getEntity() instanceof Zombie zombie))
            return;

        WorldState state = LavenderRP.getInstance()
                .getBootstrap()
                .getWorldState();

        long day = state.getDay();

        double health = 20 + (day * 0.5);
        double damage = 3 + (day * 0.15);

        zombie.getAttribute(Attribute.MAX_HEALTH).setBaseValue(health);
        zombie.setHealth(health);

        zombie.getAttribute(Attribute.ATTACK_DAMAGE).setBaseValue(damage);

        zombie.setCustomName("§2Infected");
        zombie.setCustomNameVisible(false);

        World world = zombie.getWorld();

        long time = world.getTime();

        boolean night = time >= 13000 && time <= 23000;

        if (day >= 20) {

            zombie.setCanBreakDoors(true);

        } else if (night) {

            if (ThreadLocalRandom.current().nextInt(100) < 20) {

                zombie.setCanBreakDoors(true);

            }

        }

    }

}