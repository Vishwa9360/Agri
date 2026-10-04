package com.example.demo.exception;

public class InvalidPhoneException extends RuntimeException {

    public InvalidPhoneException(String message) {
        super(message);
    }
}
