package com.example.demo.exception;

public class DuplicateFarmException extends RuntimeException {

    public DuplicateFarmException(String message) {
        super(message);
    }
}
