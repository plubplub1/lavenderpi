package me.lavender.game;

import org.bukkit.Location;

public class CrashSite {

    private final Location location;

    private boolean active = true;

    private long expireTime;

public CrashSite(Location location) {

    this.location = location.clone();

    this.expireTime =
            System.currentTimeMillis() + (15 * 60 * 1000);

}

public boolean isExpired() {
    return System.currentTimeMillis() >= expireTime;
}

    public Location getLocation() {
        return location;
    }

    public boolean isActive() {
        return active;
    }

    public void deactivate() {
        active = false;
    }

}