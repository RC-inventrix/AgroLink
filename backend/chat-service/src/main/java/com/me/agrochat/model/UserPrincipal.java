package com.me.agrochat.model;


import java.security.Principal;

public record UserPrincipal(String name) implements Principal {
    @Override
    public String getName() {
        return name;
    }
}
