package com.example.demo.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class CustomJwtAuthenticationConverter
        implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {

        List<SimpleGrantedAuthority> authorities =
                new ArrayList<>();

        // ROLE_ADMIN / ROLE_HR / ROLE_EMPLOYEE
        String role = jwt.getClaimAsString("role");

        if (role != null && !role.isBlank()) {

            authorities.add(
                    new SimpleGrantedAuthority(
                            "ROLE_" + role
                    )
            );
        }

        // Permission authorities
        List<String> permissions =
                jwt.getClaimAsStringList("permissions");

        if (permissions != null) {

            permissions.forEach(permission ->
                    authorities.add(
                            new SimpleGrantedAuthority(
                                    permission
                            )
                    )
            );
        }

        return new JwtAuthenticationToken(
                jwt,
                authorities,
                jwt.getSubject()
        );
    }
}