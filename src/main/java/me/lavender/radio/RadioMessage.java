package com.lavender.system.radio;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * An immutable single broadcast: one category and one or more lines of text.
 * Multi-line support exists so future story-event broadcasts can send a
 * short exchange (e.g. two lines) as a single coherent message, without
 * changing this class.
 */
public final class RadioMessage {

    private final RadioCategory category;
    private final List<String> lines;

    public RadioMessage(RadioCategory category, String... lines) {
        this.category = Objects.requireNonNull(category, "category");
        if (lines == null || lines.length == 0) {
            throw new IllegalArgumentException("RadioMessage requires at least one line of text");
        }
        this.lines = Collections.unmodifiableList(List.of(lines));
    }

    public RadioCategory getCategory() {
        return category;
    }

    public List<String> getLines() {
        return lines;
    }
}
