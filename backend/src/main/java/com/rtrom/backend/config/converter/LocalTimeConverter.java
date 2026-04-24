package com.rtrom.backend.config.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.sql.Time;

@Converter(autoApply = false)
public class LocalTimeConverter implements AttributeConverter<LocalTime, Time> {

    @Override
    public Time convertToDatabaseColumn(LocalTime attribute) {
        return attribute == null ? null : Time.valueOf(attribute);
    }

    @Override
    public LocalTime convertToEntityAttribute(Time dbData) {
        if (dbData == null) {
            return null;
        }
        // Avoid dbData.toLocalTime() which might fail if the driver returns invalid nanos
        // Manual conversion is safer in this edge case
        @SuppressWarnings("deprecation")
        int h = dbData.getHours();
        @SuppressWarnings("deprecation")
        int m = dbData.getMinutes();
        @SuppressWarnings("deprecation")
        int s = dbData.getSeconds();
        return LocalTime.of(h, m, s);
    }
}
