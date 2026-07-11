package me.lavender.module;

import java.util.ArrayList;
import java.util.List;

public class ModuleManager {

    private final List<Module> modules = new ArrayList<>();

    public void register(Module module) {

        modules.add(module);

        module.enable();

    }

    public void shutdown() {

        for (Module module : modules) {
            module.disable();
        }

    }

}