package me.lavender.commands;

import me.lavender.core.LavenderRP;

import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;

public class LavenderCommand implements CommandExecutor {

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {

        if (args.length == 0) {

            sender.sendMessage("§d§lProject Lavender");
            sender.sendMessage("§7/lav nextday");
            sender.sendMessage("§7/lav info");

            return true;

        }

        switch (args[0].toLowerCase()) {

case "crash" -> {

    if (!(sender instanceof Player player)) {
        sender.sendMessage("§cOnly players can use this command.");
        return true;
    }

    if (LavenderRP.getInstance()
            .getBootstrap()
            .getPlaneCrashManager()
            .hasActiveCrash()) {

        sender.sendMessage("§cThere is already an active crash site.");
        return true;
    }

    LavenderRP.getInstance()
            .getBootstrap()
            .getPlaneCrashManager()
            .spawnCrash(
                    player.getWorld(),
                    player.getLocation()
            );

    sender.sendMessage("§aCrash site spawned.");
}

    case "info" -> {

        var state = LavenderRP.getInstance()
                .getBootstrap()
                .getWorldState();

        sender.sendMessage("§7Day: §f" + state.getDay());
        sender.sendMessage("§7Phase: §f" + state.getPhase().name());

    }

    case "nextday" -> {

        LavenderRP.getInstance()
                .getBootstrap()
                .getDayManager()
                .nextDay();

        sender.sendMessage("§aAdvanced to next day.");

    }

    case "resetday" -> {

        var state = LavenderRP.getInstance()
                .getBootstrap()
                .getWorldState();

        state.setDay(1);

        LavenderRP.getInstance()
                .getBootstrap()
                .getWorldDataManager()
                .save(state);

        sender.sendMessage("§aDay has been reset to 1.");

    }

    case "setday" -> {

        if (args.length < 2) {
            sender.sendMessage("§cUsage: /lav setday <day>");
            return true;
        }

        try {

            long day = Long.parseLong(args[1]);

            var state = LavenderRP.getInstance()
                    .getBootstrap()
                    .getWorldState();

            state.setDay(day);

            LavenderRP.getInstance()
                    .getBootstrap()
                    .getWorldDataManager()
                    .save(state);

            sender.sendMessage("§aDay set to " + day);

        } catch (NumberFormatException e) {

            sender.sendMessage("§cInvalid number.");

        }

    }

    default -> sender.sendMessage("§cUnknown subcommand.");
}

        return true;

    }

}