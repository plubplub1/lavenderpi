package com.lavender.system.radio;

import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.plugin.Plugin;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.logging.Level;

/**
 * Owns the entire radio system: message pool, weighted random selection,
 * broadcasting (chat + sound), and the extension hooks other Lavender
 * systems can use to influence it.
 *
 * Lifecycle: constructed and started once from Bootstrap. No commands,
 * no manual trigger — it runs for the lifetime of the server.
 */
public final class RadioManager {

    // ---- Tuning constants (kept named, never inlined as magic numbers) ----
    private static final int MIN_DELAY_MINUTES = 8;
    private static final int MAX_DELAY_MINUTES = 15;
    private static final int TICKS_PER_MINUTE = 1200; // 20 ticks/sec * 60 sec
    private static final double SILENCE_CHANCE = 0.30; // 30% chance a cycle produces nothing
    private static final String CHAT_PREFIX = "§8[Unknown Frequency]";
    private static final String CHAT_LINE_COLOR = "§7";

    private final Plugin plugin;
    private final Map<RadioCategory, List<RadioMessage>> messagePool = new EnumMap<>(RadioCategory.class);

    // Extension hook storage: "sourceId:CATEGORY" -> multiplier
    private final Map<String, Double> weightModifiers = new ConcurrentHashMap<>();

    private RadioTask activeTask;
    private boolean running = false;

    public RadioManager(Plugin plugin) {
        this.plugin = plugin;
        loadDefaultMessages();
    }

    // ========================= Lifecycle =========================

    /**
     * Starts the radio loop. Idempotent — calling twice has no extra effect.
     * Must be called exactly once, from Bootstrap, on server start.
     */
    public void start() {
        if (running) {
            return;
        }
        running = true;
        scheduleNextTask();
        plugin.getLogger().info("[Radio] Radio system started.");
    }

    /**
     * Stops the radio loop. Provided for symmetry / plugin disable safety;
     * not required to be called for normal operation.
     */
    public void stop() {
        running = false;
        if (activeTask != null) {
            try {
                activeTask.cancel();
            } catch (IllegalStateException ignored) {
                // already cancelled/completed - safe to ignore
            }
            activeTask = null;
        }
    }

    /**
     * Package-private: called by RadioTask after each cycle to queue the
     * next one with a fresh random delay.
     */
    void scheduleNextTask() {
        if (!running) {
            return;
        }
        long delayTicks = randomDelayTicks();
        activeTask = new RadioTask(this);
        activeTask.runTaskLater(plugin, delayTicks);
    }

    private long randomDelayTicks() {
        int minutes = ThreadLocalRandom.current().nextInt(MIN_DELAY_MINUTES, MAX_DELAY_MINUTES + 1);
        return (long) minutes * TICKS_PER_MINUTE;
    }

    // ===================== Core broadcast logic =====================

    /**
     * Package-private: invoked by RadioTask once per cycle. Decides whether
     * anything happens at all, and if so, which category and message.
     */
    void attemptBroadcast() {
        if (ThreadLocalRandom.current().nextDouble() < SILENCE_CHANCE) {
            return; // nothing happens this cycle - silence is part of the design
        }

        RadioCategory category = rollCategory();
        RadioMessage message = pickMessage(category);
        if (message != null) {
            broadcast(message);
        }
    }

    private RadioCategory rollCategory() {
        RadioCategory[] categories = RadioCategory.values();
        double[] effectiveWeights = new double[categories.length];
        double totalWeight = 0.0;

        for (int i = 0; i < categories.length; i++) {
            effectiveWeights[i] = getEffectiveWeight(categories[i]);
            totalWeight += effectiveWeights[i];
        }

        if (totalWeight <= 0.0) {
            // All weights zeroed out by modifiers - fall back to STATIC.
            return RadioCategory.STATIC;
        }

        double roll = ThreadLocalRandom.current().nextDouble() * totalWeight;
        double cumulative = 0.0;
        for (int i = 0; i < categories.length; i++) {
            cumulative += effectiveWeights[i];
            if (roll <= cumulative) {
                return categories[i];
            }
        }
        return categories[categories.length - 1];
    }

    private RadioMessage pickMessage(RadioCategory category) {
        List<RadioMessage> pool = messagePool.get(category);
        if (pool == null || pool.isEmpty()) {
            return null;
        }
        int index = ThreadLocalRandom.current().nextInt(pool.size());
        return pool.get(index);
    }

    private void broadcast(RadioMessage message) {
        for (Player player : Bukkit.getOnlinePlayers()) {
            sendToPlayer(player, message);
        }
    }

    private void sendToPlayer(Player player, RadioMessage message) {
        player.sendMessage(CHAT_PREFIX);
        for (String line : message.getLines()) {
            player.sendMessage(CHAT_LINE_COLOR + "\"" + line + "\"");
        }
        playSoundSafely(player, message.getCategory());
    }

    private void playSoundSafely(Player player, RadioCategory category) {
        try {
            player.playSound(player.getLocation(), category.getSoundKey(),
                    category.getSoundVolume(), category.getSoundPitch());
        } catch (Exception e) {
            // A missing/undefined custom sound must never break the radio system.
            plugin.getLogger().log(Level.FINE, "[Radio] Sound unavailable: " + category.getSoundKey(), e);
        }
    }

    // ================ Extensibility hooks (future systems) ================
    //
    // Other systems (Fog, BloodMoon, PlaneCrashManager, story events, zombie
    // hordes) can bias which category is more likely to appear WITHOUT
    // RadioManager knowing those systems exist, by pushing/removing a named
    // weight modifier keyed by their own identifier. Example:
    //
    //   radioManager.setWeightModifier("FOG", RadioCategory.UNKNOWN, 2.5);
    //   radioManager.setWeightModifier("FOG", RadioCategory.STATIC, 1.5);
    //   ...
    //   radioManager.clearWeightModifier("FOG", RadioCategory.UNKNOWN);
    //
    // Or clear everything a source added at once, e.g. when fog ends:
    //   radioManager.clearAllModifiersFrom("FOG");
    //
    // This keeps RadioManager closed for modification but open for
    // extension - no rewrite needed when new systems come online.

    public void setWeightModifier(String sourceId, RadioCategory category, double multiplier) {
        weightModifiers.put(modifierKey(sourceId, category), multiplier);
    }

    public void clearWeightModifier(String sourceId, RadioCategory category) {
        weightModifiers.remove(modifierKey(sourceId, category));
    }

    public void clearAllModifiersFrom(String sourceId) {
        String prefix = sourceId + ":";
        weightModifiers.keySet().removeIf(key -> key.startsWith(prefix));
    }

    private String modifierKey(String sourceId, RadioCategory category) {
        return sourceId + ":" + category.name();
    }

    private double getEffectiveWeight(RadioCategory category) {
        double weight = category.getBaseWeight();
        String suffix = ":" + category.name();
        for (Map.Entry<String, Double> entry : weightModifiers.entrySet()) {
            if (entry.getKey().endsWith(suffix)) {
                weight *= entry.getValue();
            }
        }
        return Math.max(weight, 0.0);
    }

    // ========================= Message pool =========================

    private void loadDefaultMessages() {
        for (RadioCategory category : RadioCategory.values()) {
            messagePool.put(category, new ArrayList<>());
        }

        register(RadioCategory.STATIC,
                "kssshhhhh...",
                "...",
                "*radio interference*",
                "krrzzzt...",
                "...ssshhhh...krkrk...",
                "*static hum*",
                "...nothing but noise...",
                "bzzzzt...ksshhh..."
        );

        register(RadioCategory.SURVIVOR,
                "...Can anyone hear me...",
                "...We lost everyone...",
                "...Please answer...",
                "...We're trapped...",
                "...Is anyone still out there...",
                "...They found our camp...",
                "...I don't know how much longer we can hold...",
                "...If you can hear this, stay away from the city...",
                "...We're running low on supplies...",
                "...Please, someone, respond..."
        );

        register(RadioCategory.MILITARY,
                "Military checkpoint Delta has fallen.",
                "Do NOT approach the northern bridge.",
                "Evacuation cancelled.",
                "All units, fall back to secondary perimeter.",
                "Checkpoint Bravo is no longer secure.",
                "Quarantine zone breach reported in sector seven.",
                "This frequency is restricted to command personnel.",
                "Supply convoy has gone dark. Presume lost."
        );

        register(RadioCategory.EMERGENCY,
                "This is an emergency broadcast.",
                "Remain inside your shelter.",
                "Unknown infection confirmed.",
                "Do not attempt to travel after dark.",
                "This broadcast will repeat at the top of the hour.",
                "Boil all water before consumption.",
                "Avoid contact with infected individuals.",
                "This is not a test."
        );

        register(RadioCategory.UNKNOWN,
                "...",
                "...don't let them...",
                "...it's watching...",
                "...run...",
                "...it's already inside...",
                "...don't answer if it calls your name...",
                "...they're not who they sound like...",
                "...stop listening..."
        );
    }

    private void register(RadioCategory category, String... lines) {
        List<RadioMessage> pool = messagePool.get(category);
        for (String line : lines) {
            pool.add(new RadioMessage(category, line));
        }
    }
}
