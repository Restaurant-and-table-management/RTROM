package com.rtrom.backend.config.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.sql.Timestamp;

@Converter(autoApply = false)
public class LocalDateTimeConverter implements AttributeConverter<LocalDateTime, Timestamp> {

    @Override
    public Timestamp convertToDatabaseColumn(LocalDateTime attribute) {
        return attribute == null ? null : Timestamp.valueOf(attribute);
    }

    @Override
    public LocalDateTime convertToEntityAttribute(Timestamp dbData) {
        if (dbData == null) {
            return null;
        }
        // Use epoch milliseconds to avoid precision/nanosecond issues during mapping.
        // dbData.getTime() returns the number of milliseconds since the epoch, which is always safe.
        return LocalDateTime.ofInstant(java.time.Instant.ofEpochMilli(dbData.getTime()), ZoneId.systemDefault());
    }
}
