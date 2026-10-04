package com.examly.springapp.exception;

public class DuplicateFarmException extends RuntimeException {
    public DuplicateFarmException(String message) {
        super(message);
    }
}
