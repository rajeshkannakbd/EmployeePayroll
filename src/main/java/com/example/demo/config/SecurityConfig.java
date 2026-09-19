package com.example.demo.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    // ==================================================
    // PASSWORD ENCODER
    // ==================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // ==================================================
    // JWT ROLE CONVERTER
    // ==================================================

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        // Read "role" claim from JWT
        authoritiesConverter.setAuthoritiesClaimName("role");

        // ADMIN -> ROLE_ADMIN
        // HR -> ROLE_HR
        // EMPLOYEE -> ROLE_EMPLOYEE
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                authoritiesConverter
        );

        return converter;
    }


    // ==================================================
    // CORS CONFIGURATION
    // ==================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // React frontend
        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        // Allowed HTTP methods
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        // Allow request headers
        configuration.setAllowedHeaders(
                List.of("*")
        );

        // IMPORTANT:
        // Use the concrete class here, not CorsConfigurationSource
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }


    // ==================================================
    // SECURITY FILTER CHAIN
    // ==================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // Enable CORS
                .cors(Customizer.withDefaults())

                // Disable CSRF for REST API
                .csrf(csrf -> csrf.disable())

                // JWT is stateless
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // ==================================================
                // AUTHORIZATION RULES
                // ==================================================

                .authorizeHttpRequests(auth -> auth

                        // ------------------------------------------
                        // PUBLIC LOGIN
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/auth/login"
                        ).permitAll()


                        // ------------------------------------------
                        // CORS PREFLIGHT
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()


                        // ------------------------------------------
                        // EMPLOYEE SELF ACCESS
                        // ------------------------------------------

                        .requestMatchers(
                                "/employees/me"
                        ).hasRole("EMPLOYEE")


                        .requestMatchers(
                                "/attendance/me"
                        ).hasRole("EMPLOYEE")


                        .requestMatchers(
                                "/payrolls/me/**"
                        ).hasRole("EMPLOYEE")


                        // ------------------------------------------
                        // DEPARTMENTS
                        // ------------------------------------------

                        .requestMatchers(
                                "/departments/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "HR"
                        )


                        // ------------------------------------------
                        // SALARY STRUCTURE
                        // ------------------------------------------

                        .requestMatchers(
                                "/salary-structures/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "HR"
                        )


                        // ------------------------------------------
                        // ATTENDANCE
                        // ------------------------------------------

                        .requestMatchers(
                                "/attendance/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "HR"
                        )


                        // ------------------------------------------
                        // PAYROLL
                        // ------------------------------------------

                        .requestMatchers(
                                "/payrolls/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "HR"
                        )


                        // ------------------------------------------
                        // EVERYTHING ELSE
                        // ------------------------------------------

                        .anyRequest().authenticated()
                )


                // ==================================================
                // JWT AUTHENTICATION
                // ==================================================

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter()
                                )
                        )
                );

        return http.build();
    }
}