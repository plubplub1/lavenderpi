package me.lavender.loot;

import me.lavender.core.LavenderRP;
import org.bukkit.Material;
import org.bukkit.NamespacedKey;
import org.bukkit.block.Chest;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryOpenEvent;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;
import org.bukkit.persistence.PersistentDataType;

import java.util.Random;

public class LootListener implements Listener {

    private final Random random = new Random();

    @EventHandler
    public void onOpen(InventoryOpenEvent event) {

        if (!(event.getInventory().getHolder() instanceof Chest chest))
            return;

        if (chest.getPersistentDataContainer().has(key))
            return;

        Inventory inv = chest.getInventory();

        inv.clear();

        add(inv, Material.BREAD, 70);
        add(inv, Material.APPLE, 60);
        add(inv, Material.COOKED_BEEF, 40);
        add(inv, Material.WATER_BUCKET, 15);
        add(inv, Material.TORCH, 60);
        add(inv, Material.STONE_AXE, 15);
        add(inv, Material.IRON_AXE, 5);

        chest.getPersistentDataContainer().set(
                key,
                PersistentDataType.BYTE,
                (byte) 1
        );

        chest.update();

    }

    private final NamespacedKey key;

public LootListener(LavenderRP plugin) {
    this.key = new NamespacedKey(plugin, "generated_loot");
}


    private void add(Inventory inv, Material material, int chance) {

        if (random.nextInt(100) >= chance)
            return;

        inv.addItem(
                new ItemStack(
                        material,
                        random.nextInt(3) + 1
                )
        );

    }

}