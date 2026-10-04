package com.example.demo.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Converter
public class AttributeEncryptor implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";

    private final Key key;

    public AttributeEncryptor(@Value("${security.encryption.key:SmartFarmingAes256SecretKey2026}") String secret) {
        // Normalize to exactly 16 or 32 bytes for AES
        byte[] keyBytes = new byte[32];
        byte[] sourceBytes = secret.getBytes(StandardCharsets.UTF_8);
        System.arraycopy(sourceBytes, 0, keyBytes, 0, Math.min(sourceBytes.length, 32));
        this.key = new SecretKeySpec(keyBytes, ALGORITHM);
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.trim().isEmpty()) {
            return attribute;
        }
        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encrypted = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));
            return "ENC:" + Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            log.error("Failed to encrypt sensitive attribute: {}", e.getMessage());
            return attribute;
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || !dbData.startsWith("ENC:")) {
            return dbData;
        }
        try {
            String base64 = dbData.substring(4);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(base64));
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to decrypt sensitive attribute: {}", e.getMessage());
            return dbData;
        }
    }
}
